import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockPrisma = {
      transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      user: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    delete process.env.BINANCE_PAY_API_KEY;
    delete process.env.BINANCE_PAY_SECRET_KEY;
    delete process.env.BINANCE_PAY_MERCHANT_ID;
    delete process.env.NODE_ENV;
    delete process.env.FRONTEND_URL;
    delete process.env.BACKEND_URL;
    delete process.env.MOCK_WEBHOOK_SECRET;
  });

  describe('createDeposit', () => {
    describe('input validation', () => {
      it('should throw BadRequestException when amount is 0', async () => {
        await expect(service.createDeposit(1, 0, 'mock')).rejects.toThrow(
          'Amount must be greater than 0',
        );
      });

      it('should throw BadRequestException when amount is negative', async () => {
        await expect(service.createDeposit(1, -50, 'mock')).rejects.toThrow(
          'Amount must be greater than 0',
        );
      });

      it('should throw BadRequestException when amount exceeds max', async () => {
        await expect(service.createDeposit(1, 100001, 'mock')).rejects.toThrow(
          'Maximum deposit is $100,000',
        );
      });

      it('should accept valid amount at max boundary', async () => {
        const mockTx = { id: 1, gatewayTxId: 'TX_123' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        const result = await service.createDeposit(1, 100000, 'mock');
        expect(result.transactionId).toBe(1);
      });
    });

    describe('binance gateway', () => {
      beforeEach(() => {
        process.env.BINANCE_PAY_API_KEY = 'test-api-key';
        process.env.BINANCE_PAY_SECRET_KEY = 'test-secret-key';
        process.env.BINANCE_PAY_MERCHANT_ID = 'test-merchant-id';
      });

      it('should create binance deposit successfully', async () => {
        const mockTx = { id: 1, gatewayTxId: 'BSMM1_123456' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        mockedAxios.post.mockResolvedValue({
          data: {
            status: 'SUCCESS',
            data: {
              universalUrl: 'https://pay.binance.com/checkout/123',
              qrcodeLink: 'https://pay.binance.com/qr/123',
            },
          },
        });

        const result = await service.createDeposit(1, 100, 'binance');

        expect(result).toEqual({
          transactionId: 1,
          gatewayUrl: 'https://pay.binance.com/checkout/123',
          gatewayTxId: 'BSMM1_123456',
          qrCodeUrl: 'https://pay.binance.com/qr/123',
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://bpay.binanceapi.com/binancepay/openapi/v3/order',
          expect.objectContaining({
            currency: 'USDT',
            goods: expect.objectContaining({
              goodsName: 'BalkanSMM Fund Deposit',
            }),
          }),
          expect.objectContaining({
            headers: expect.objectContaining({
              'BinancePay-Certificate-SN': 'test-api-key',
            }),
          }),
        );

        expect(prismaService.transaction.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 1,
            amount: 100,
            type: 'deposit',
            gateway: 'binance',
            gatewayStatus: 'pending',
          }),
        });
      });

      it('should warn when credentials are missing', async () => {
        delete process.env.BINANCE_PAY_API_KEY;
        delete process.env.BINANCE_PAY_MERCHANT_ID;

        const loggerWarnSpy = jest.spyOn((service as any).logger, 'warn');

        mockedAxios.post.mockRejectedValue(new Error('Auth failed'));

        const mockTx = { id: 1, gatewayTxId: 'TX_123_456' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        await service.createDeposit(1, 100, 'binance');

        expect(loggerWarnSpy).toHaveBeenCalledWith(
          'BINANCE_PAY credentials missing',
        );
      });

      it('should throw BadRequestException in production when binance API fails', async () => {
        process.env.NODE_ENV = 'production';

        mockedAxios.post.mockRejectedValue(new Error('API Error'));

        await expect(service.createDeposit(1, 100, 'binance')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should fall back to mock when binance API fails in development', async () => {
        process.env.NODE_ENV = 'development';

        mockedAxios.post.mockRejectedValue(new Error('API Error'));

        const mockTx = { id: 2, gatewayTxId: 'TX_123_456' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        const result = await service.createDeposit(1, 100, 'binance');

        expect(result).toEqual({
          transactionId: 2,
          gatewayUrl: expect.stringContaining('mock_success=true'),
          gatewayTxId: 'TX_123_456',
        });
      });

      it('should throw when binance returns non-SUCCESS status', async () => {
        process.env.NODE_ENV = 'production';

        mockedAxios.post.mockResolvedValue({
          data: {
            status: 'FAIL',
            errorMessage: 'Insufficient funds',
          },
        });

        await expect(service.createDeposit(1, 100, 'binance')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should use default URLs when env vars not set', async () => {
        delete process.env.FRONTEND_URL;
        delete process.env.BACKEND_URL;

        const mockTx = { id: 1, gatewayTxId: 'BSMM1_123' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        mockedAxios.post.mockResolvedValue({
          data: {
            status: 'SUCCESS',
            data: {
              universalUrl: 'https://test.com',
              qrcodeLink: 'https://qr.com',
            },
          },
        });

        await service.createDeposit(1, 50, 'binance');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            returnUrl: 'http://localhost:3000/dashboard',
            cancelUrl: 'http://localhost:3000/dashboard/add-funds',
            webhookUrl: 'http://localhost:3001/payments/binance-webhook',
          }),
          expect.any(Object),
        );
      });

      it('should use custom URLs from env vars', async () => {
        process.env.FRONTEND_URL = 'https://mysite.com';
        process.env.BACKEND_URL = 'https://api.mysite.com';

        const mockTx = { id: 1, gatewayTxId: 'BSMM1_123' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        mockedAxios.post.mockResolvedValue({
          data: {
            status: 'SUCCESS',
            data: {
              universalUrl: 'https://test.com',
              qrcodeLink: 'https://qr.com',
            },
          },
        });

        await service.createDeposit(1, 50, 'binance');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            returnUrl: 'https://mysite.com/dashboard',
            cancelUrl: 'https://mysite.com/dashboard/add-funds',
            webhookUrl: 'https://api.mysite.com/payments/binance-webhook',
          }),
          expect.any(Object),
        );
      });

      it('should format amount to 2 decimal places', async () => {
        const mockTx = { id: 1, gatewayTxId: 'BSMM1_123' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        mockedAxios.post.mockResolvedValue({
          data: {
            status: 'SUCCESS',
            data: {
              universalUrl: 'https://test.com',
              qrcodeLink: 'https://qr.com',
            },
          },
        });

        await service.createDeposit(1, 99.999, 'binance');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            orderAmount: '100.00',
          }),
          expect.any(Object),
        );
      });

      it('should sanitize error logging (no sensitive data leaked)', async () => {
        process.env.NODE_ENV = 'development';

        const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');

        mockedAxios.post.mockRejectedValue({
          response: {
            data: {
              status: 'FAIL',
              code: 'INVALID_SIGNATURE',
              secretKey: 'THIS_SHOULD_NOT_APPEAR',
            },
          },
        });

        const mockTx = { id: 1, gatewayTxId: 'TX_123' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        await service.createDeposit(1, 100, 'binance');

        expect(loggerErrorSpy).toHaveBeenCalled();
        const logMessage = loggerErrorSpy.mock.calls[0][0];
        expect(logMessage).not.toContain('THIS_SHOULD_NOT_APPEAR');
        expect(logMessage).toContain('status=FAIL');
        expect(logMessage).toContain('code=INVALID_SIGNATURE');
      });
    });

    describe('mock/other gateway', () => {
      it('should create mock deposit for non-binance gateway', async () => {
        const mockTx = { id: 5, gatewayTxId: 'TX_999_111' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        const result = await service.createDeposit(2, 50, 'manual');

        expect(result).toEqual({
          transactionId: 5,
          gatewayUrl:
            'http://localhost:3000/dashboard/add-funds?mock_success=true&amount=50',
          gatewayTxId: 'TX_999_111',
        });

        expect(prismaService.transaction.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 2,
            amount: 50,
            gateway: 'manual',
            gatewayStatus: 'pending',
          }),
        });
      });

      it('should use "mock" as default gateway when empty string provided', async () => {
        const mockTx = { id: 6, gatewayTxId: 'TX_888_222' };
        (prismaService.transaction.create as jest.Mock).mockResolvedValue(
          mockTx,
        );

        await service.createDeposit(3, 25, '');

        expect(prismaService.transaction.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            gateway: 'mock',
          }),
        });
      });
    });
  });

  describe('verifyBinanceWebhookSignature', () => {
    beforeEach(() => {
      process.env.BINANCE_PAY_SECRET_KEY = 'test-secret';
    });

    it('should return true for valid signature', () => {
      const timestamp = '1234567890';
      const nonce = 'abc123';
      const body = '{"test":"data"}';

      const payload = `${timestamp}\n${nonce}\n${body}\n`;
      const expectedSignature = crypto
        .createHmac('sha512', 'test-secret')
        .update(payload)
        .digest('hex')
        .toUpperCase();

      const result = service.verifyBinanceWebhookSignature(
        timestamp,
        nonce,
        body,
        expectedSignature,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const result = service.verifyBinanceWebhookSignature(
        '123',
        'abc',
        '{}',
        'INVALID_SIG',
      );
      expect(result).toBe(false);
    });

    it('should handle empty secret key', () => {
      delete process.env.BINANCE_PAY_SECRET_KEY;

      const payload = '123\nabc\n{}\n';
      const expectedSignature = crypto
        .createHmac('sha512', '')
        .update(payload)
        .digest('hex')
        .toUpperCase();

      const result = service.verifyBinanceWebhookSignature(
        '123',
        'abc',
        '{}',
        expectedSignature,
      );
      expect(result).toBe(true);
    });
  });

  describe('processBinanceWebhook', () => {
    beforeEach(() => {
      process.env.BINANCE_PAY_SECRET_KEY = 'webhook-secret';
    });

    const generateValidSignature = (
      payload: any,
      timestamp: string,
      nonce: string,
    ) => {
      const body = JSON.stringify(payload);
      const signPayload = `${timestamp}\n${nonce}\n${body}\n`;
      return crypto
        .createHmac('sha512', 'webhook-secret')
        .update(signPayload)
        .digest('hex')
        .toUpperCase();
    };

    it('should throw BadRequestException for invalid signature', async () => {
      const payload = { bizStatus: 'PAY_SUCCESS', merchantTradeNo: 'TX123' };

      await expect(
        service.processBinanceWebhook(payload, '123', 'nonce', 'INVALID'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return OK for non PAY_SUCCESS status', async () => {
      const payload = { bizStatus: 'PAY_CLOSED', merchantTradeNo: 'TX123' };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      const result = await service.processBinanceWebhook(
        payload,
        timestamp,
        nonce,
        signature,
      );

      expect(result).toEqual({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    });

    it('should return OK when transaction not found', async () => {
      const payload = {
        bizStatus: 'PAY_SUCCESS',
        merchantTradeNo: 'NOTFOUND123',
      };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue(null),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: jest.fn() },
          });
        },
      );

      const result = await service.processBinanceWebhook(
        payload,
        timestamp,
        nonce,
        signature,
      );

      expect(result).toEqual({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    });

    it('should return "Already processed" for completed transaction', async () => {
      const payload = { bizStatus: 'PAY_SUCCESS', merchantTradeNo: 'TX123' };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue({
                id: 1,
                gatewayStatus: 'completed',
                userId: 1,
                amount: 100,
              }),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: jest.fn() },
          });
        },
      );

      const result = await service.processBinanceWebhook(
        payload,
        timestamp,
        nonce,
        signature,
      );

      expect(result).toEqual({
        returnCode: 'SUCCESS',
        returnMessage: 'Already processed',
      });
    });

    it('should process successful payment and update balance', async () => {
      const payload = {
        bizStatus: 'PAY_SUCCESS',
        merchantTradeNo: 'TX123',
        orderAmount: '100.00',
      };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      const mockTxUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 200, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue({
                id: 1,
                gatewayStatus: 'pending',
                userId: 1,
                amount: 100,
              }),
              update: jest.fn(),
              updateMany: mockTxUpdateMany,
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processBinanceWebhook(
        payload,
        timestamp,
        nonce,
        signature,
      );

      expect(mockTxUpdateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          gatewayStatus: { not: 'completed' },
        },
        data: { gatewayStatus: 'completed' },
      });

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: { increment: 100 } },
      });

      expect(result).toEqual({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    });

    it('should handle race condition with updateMany returning 0', async () => {
      const payload = { bizStatus: 'PAY_SUCCESS', merchantTradeNo: 'TX123' };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      const mockTxUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
      const mockUserUpdate = jest.fn();

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue({
                id: 1,
                gatewayStatus: 'pending',
                userId: 1,
                amount: 100,
              }),
              updateMany: mockTxUpdateMany,
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processBinanceWebhook(
        payload,
        timestamp,
        nonce,
        signature,
      );

      expect(result).toEqual({
        returnCode: 'SUCCESS',
        returnMessage: 'Already processed',
      });
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it('should credit affiliate commission when user has referrer', async () => {
      const payload = { bizStatus: 'PAY_SUCCESS', merchantTradeNo: 'TX123' };
      const timestamp = '123456';
      const nonce = 'testnonce';
      const signature = generateValidSignature(payload, timestamp, nonce);

      const mockUserUpdate = jest
        .fn()
        .mockResolvedValueOnce({ id: 1, balance: 200, referredById: 99 })
        .mockResolvedValueOnce({ id: 99, affiliateBalance: 10 });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue({
                id: 1,
                gatewayStatus: 'pending',
                userId: 1,
                amount: 100,
              }),
              update: jest.fn(),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      await service.processBinanceWebhook(payload, timestamp, nonce, signature);

      expect(mockUserUpdate).toHaveBeenCalledTimes(2);
      expect(mockUserUpdate).toHaveBeenLastCalledWith({
        where: { id: 99 },
        data: { affiliateBalance: { increment: 10 } },
      });
    });
  });

  describe('processWebhook (mock webhook)', () => {
    it('should throw BadRequestException for invalid secret', async () => {
      await expect(
        service.processWebhook(1, 100, 'wrong_secret'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use env var for secret validation', async () => {
      process.env.MOCK_WEBHOOK_SECRET = 'custom_secret_123';

      await expect(
        service.processWebhook(1, 100, 'my_mock_secret'),
      ).rejects.toThrow(BadRequestException);

      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 200, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processWebhook(1, 100, 'custom_secret_123');
      expect(result.success).toBe(true);
    });

    it('should fall back to default secret when env not set', async () => {
      delete process.env.MOCK_WEBHOOK_SECRET;

      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 150, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processWebhook(1, 50, 'my_mock_secret');
      expect(result).toEqual({ success: true, newBalance: 150 });
    });

    it('should process webhook without txId', async () => {
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 150, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processWebhook(1, 50, 'my_mock_secret');

      expect(result).toEqual({ success: true, newBalance: 150 });
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: { increment: 50 } },
      });
    });

    it('should return "Already processed" for completed txId', async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest
                .fn()
                .mockResolvedValue({ id: 1, gatewayStatus: 'completed' }),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: jest.fn() },
          });
        },
      );

      const result = await service.processWebhook(
        1,
        50,
        'my_mock_secret',
        'TX_COMPLETED',
      );

      expect(result).toEqual({ success: true, message: 'Already processed' });
    });

    it('should update transaction status when txId found and pending', async () => {
      const mockTxUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 100, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest
                .fn()
                .mockResolvedValue({ id: 5, gatewayStatus: 'pending' }),
              update: jest.fn(),
              updateMany: mockTxUpdateMany,
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      await service.processWebhook(1, 50, 'my_mock_secret', 'TX_PENDING');

      expect(mockTxUpdateMany).toHaveBeenCalledWith({
        where: {
          id: 5,
          gatewayStatus: { not: 'completed' },
        },
        data: { gatewayStatus: 'completed' },
      });
    });

    it('should handle race condition in processWebhook', async () => {
      const mockTxUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
      const mockUserUpdate = jest.fn();

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest
                .fn()
                .mockResolvedValue({ id: 5, gatewayStatus: 'pending' }),
              updateMany: mockTxUpdateMany,
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      const result = await service.processWebhook(
        1,
        50,
        'my_mock_secret',
        'TX_RACE',
      );

      expect(result).toEqual({ success: true, message: 'Already processed' });
      expect(mockUserUpdate).not.toHaveBeenCalled();
    });

    it('should skip transaction update when txId not found', async () => {
      const mockTxUpdateMany = jest.fn();
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 100, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn().mockResolvedValue(null),
              update: jest.fn(),
              updateMany: mockTxUpdateMany,
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      await service.processWebhook(1, 50, 'my_mock_secret', 'TX_NOTFOUND');

      expect(mockTxUpdateMany).not.toHaveBeenCalled();
      expect(mockUserUpdate).toHaveBeenCalled();
    });

    it('should credit affiliate commission for referred user', async () => {
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValueOnce({ id: 1, balance: 100, referredById: 55 })
        .mockResolvedValueOnce({ id: 55, affiliateBalance: 5 });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      await service.processWebhook(1, 50, 'my_mock_secret');

      expect(mockUserUpdate).toHaveBeenCalledTimes(2);
      expect(mockUserUpdate).toHaveBeenLastCalledWith({
        where: { id: 55 },
        data: { affiliateBalance: { increment: 5 } },
      });
    });

    it('should not credit commission when user has no referrer', async () => {
      const mockUserUpdate = jest
        .fn()
        .mockResolvedValue({ id: 1, balance: 100, referredById: null });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            transaction: {
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            user: { update: mockUserUpdate },
          });
        },
      );

      await service.processWebhook(1, 50, 'my_mock_secret');

      expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateNonce (private method coverage)', () => {
    it('should generate nonce of specified length', async () => {
      const mockTx = { id: 1, gatewayTxId: 'TX_123' };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(mockTx);

      process.env.BINANCE_PAY_API_KEY = 'key';
      process.env.BINANCE_PAY_SECRET_KEY = 'secret';
      process.env.BINANCE_PAY_MERCHANT_ID = 'merchant';

      mockedAxios.post.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: {
            universalUrl: 'https://test.com',
            qrcodeLink: 'https://qr.com',
          },
        },
      });

      await service.createDeposit(1, 10, 'binance');

      const callArgs = mockedAxios.post.mock.calls[0];
      const headers = callArgs[2]?.headers as Record<string, string>;
      const nonce = headers['BinancePay-Nonce'];

      expect(nonce).toBeDefined();
      expect(nonce.length).toBe(32);
      expect(/^[a-zA-Z0-9]+$/.test(nonce)).toBe(true);
    });
  });

  describe('generateBinanceSignature (private method coverage)', () => {
    it('should generate valid HMAC-SHA512 signature', async () => {
      process.env.BINANCE_PAY_API_KEY = 'key';
      process.env.BINANCE_PAY_SECRET_KEY = 'my-secret-key';
      process.env.BINANCE_PAY_MERCHANT_ID = 'merchant';

      const mockTx = { id: 1, gatewayTxId: 'TX_123' };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(mockTx);

      mockedAxios.post.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: {
            universalUrl: 'https://test.com',
            qrcodeLink: 'https://qr.com',
          },
        },
      });

      await service.createDeposit(1, 10, 'binance');

      const callArgs = mockedAxios.post.mock.calls[0];
      const headers = callArgs[2]?.headers as Record<string, string>;
      const signature = headers['BinancePay-Signature'];

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[A-F0-9]{128}$/);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize axios response errors', async () => {
      process.env.NODE_ENV = 'development';
      process.env.BINANCE_PAY_API_KEY = 'key';
      process.env.BINANCE_PAY_SECRET_KEY = 'secret';
      process.env.BINANCE_PAY_MERCHANT_ID = 'merchant';

      const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');

      mockedAxios.post.mockRejectedValue({
        response: {
          data: {
            status: 'ERROR',
            errorCode: '500001',
          },
        },
      });

      const mockTx = { id: 1, gatewayTxId: 'TX_123' };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(mockTx);

      await service.createDeposit(1, 100, 'binance');

      const logMessage = loggerErrorSpy.mock.calls[0][0];
      expect(logMessage).toContain('status=ERROR');
      expect(logMessage).toContain('code=500001');
    });

    it('should handle errors without response data', async () => {
      process.env.NODE_ENV = 'development';
      process.env.BINANCE_PAY_API_KEY = 'key';
      process.env.BINANCE_PAY_SECRET_KEY = 'secret';
      process.env.BINANCE_PAY_MERCHANT_ID = 'merchant';

      const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');

      mockedAxios.post.mockRejectedValue(new Error('Network timeout'));

      const mockTx = { id: 1, gatewayTxId: 'TX_123' };
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(mockTx);

      await service.createDeposit(1, 100, 'binance');

      const logMessage = loggerErrorSpy.mock.calls[0][0];
      expect(logMessage).toContain('Network timeout');
    });
  });
});
