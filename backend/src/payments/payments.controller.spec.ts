import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: jest.Mocked<PaymentsService>;

  beforeEach(async () => {
    const mockPaymentsService = {
      processWebhook: jest.fn(),
      processBinanceWebhook: jest.fn(),
      createDeposit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get(PaymentsService);
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException when userId is missing', async () => {
      const body = { userId: undefined as any, amount: 100, secret: 'test' };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.handleWebhook(body)).rejects.toThrow(
        'Missing parameters',
      );
    });

    it('should throw BadRequestException when amount is missing', async () => {
      const body = { userId: 1, amount: undefined as any, secret: 'test' };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when secret is missing', async () => {
      const body = { userId: 1, amount: 100, secret: undefined as any };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when userId is 0 (falsy)', async () => {
      const body = { userId: 0, amount: 100, secret: 'test' };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when amount is 0 (falsy)', async () => {
      const body = { userId: 1, amount: 0, secret: 'test' };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when secret is empty string (falsy)', async () => {
      const body = { userId: 1, amount: 100, secret: '' };

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call processWebhook with correct parameters without txId', async () => {
      const body = { userId: 1, amount: 100, secret: 'my_mock_secret' };
      paymentsService.processWebhook.mockResolvedValue({
        success: true,
        newBalance: 200,
      });

      const result = await controller.handleWebhook(body);

      expect(paymentsService.processWebhook).toHaveBeenCalledWith(
        1,
        100,
        'my_mock_secret',
        undefined,
      );
      expect(result).toEqual({ success: true, newBalance: 200 });
    });

    it('should call processWebhook with txId when provided', async () => {
      const body = {
        userId: 5,
        amount: 50,
        secret: 'my_mock_secret',
        txId: 'TX_123',
      };
      paymentsService.processWebhook.mockResolvedValue({
        success: true,
        newBalance: 150,
      });

      const result = await controller.handleWebhook(body);

      expect(paymentsService.processWebhook).toHaveBeenCalledWith(
        5,
        50,
        'my_mock_secret',
        'TX_123',
      );
      expect(result).toEqual({ success: true, newBalance: 150 });
    });

    it('should propagate errors from service', async () => {
      const body = { userId: 1, amount: 100, secret: 'wrong' };
      paymentsService.processWebhook.mockRejectedValue(
        new BadRequestException('Invalid signature'),
      );

      await expect(controller.handleWebhook(body)).rejects.toThrow(
        'Invalid signature',
      );
    });
  });

  describe('handleBinanceWebhook', () => {
    it('should throw BadRequestException when timestamp is missing', async () => {
      await expect(
        controller.handleBinanceWebhook({}, undefined as any, 'nonce', 'sig'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.handleBinanceWebhook({}, undefined as any, 'nonce', 'sig'),
      ).rejects.toThrow('Missing Binance Pay headers');
    });

    it('should throw BadRequestException when nonce is missing', async () => {
      await expect(
        controller.handleBinanceWebhook({}, '123', undefined as any, 'sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when signature is missing', async () => {
      await expect(
        controller.handleBinanceWebhook({}, '123', 'nonce', undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when timestamp is empty string', async () => {
      await expect(
        controller.handleBinanceWebhook({}, '', 'nonce', 'sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when nonce is empty string', async () => {
      await expect(
        controller.handleBinanceWebhook({}, '123', '', 'sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when signature is empty string', async () => {
      await expect(
        controller.handleBinanceWebhook({}, '123', 'nonce', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call processBinanceWebhook with correct parameters', async () => {
      const body = { bizStatus: 'PAY_SUCCESS', merchantTradeNo: 'TX123' };
      paymentsService.processBinanceWebhook.mockResolvedValue({
        returnCode: 'SUCCESS',
        returnMessage: 'OK',
      });

      const result = await controller.handleBinanceWebhook(
        body,
        '1234567890',
        'testnonce',
        'VALIDSIG',
      );

      expect(paymentsService.processBinanceWebhook).toHaveBeenCalledWith(
        body,
        '1234567890',
        'testnonce',
        'VALIDSIG',
      );
      expect(result).toEqual({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    });

    it('should propagate errors from service', async () => {
      const body = { bizStatus: 'PAY_SUCCESS' };
      paymentsService.processBinanceWebhook.mockRejectedValue(
        new BadRequestException('Invalid webhook signature'),
      );

      await expect(
        controller.handleBinanceWebhook(body, '123', 'nonce', 'INVALID'),
      ).rejects.toThrow('Invalid webhook signature');
    });

    it('should handle complex payload body', async () => {
      const complexBody = {
        bizType: 'PAY',
        bizId: '123456789',
        bizStatus: 'PAY_SUCCESS',
        merchantTradeNo: 'BSMM1_1705847123456',
        orderAmount: '100.00',
        transactTime: 1705847123456,
        payerInfo: {
          binanceId: 'user123',
          accountType: 'SPOT',
        },
      };

      paymentsService.processBinanceWebhook.mockResolvedValue({
        returnCode: 'SUCCESS',
        returnMessage: 'OK',
      });

      await controller.handleBinanceWebhook(
        complexBody,
        '999',
        'complexnonce',
        'SIG123',
      );

      expect(paymentsService.processBinanceWebhook).toHaveBeenCalledWith(
        complexBody,
        '999',
        'complexnonce',
        'SIG123',
      );
    });
  });

  describe('createDeposit', () => {
    it('should call createDeposit with userId from request', async () => {
      const req = { user: { userId: 42 } };
      const body = { amount: 100, gateway: 'binance' };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 1,
        gatewayUrl: 'https://pay.binance.com/123',
        gatewayTxId: 'BSMM42_123',
        qrCodeUrl: 'https://qr.binance.com/123',
      });

      const result = await controller.createDeposit(req, body);

      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        42,
        100,
        'binance',
      );
      expect(result).toEqual({
        transactionId: 1,
        gatewayUrl: 'https://pay.binance.com/123',
        gatewayTxId: 'BSMM42_123',
        qrCodeUrl: 'https://qr.binance.com/123',
      });
    });

    it('should use "mock" as default gateway when not provided', async () => {
      const req = { user: { userId: 10 } };
      const body = { amount: 50, gateway: undefined as any };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 2,
        gatewayUrl: 'http://localhost:3000/mock',
        gatewayTxId: 'TX_999',
      });

      await controller.createDeposit(req, body);

      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        10,
        50,
        'mock',
      );
    });

    it('should use "mock" as default gateway when empty string', async () => {
      const req = { user: { userId: 10 } };
      const body = { amount: 50, gateway: '' };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 2,
        gatewayUrl: 'http://localhost:3000/mock',
        gatewayTxId: 'TX_999',
      });

      await controller.createDeposit(req, body);

      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        10,
        50,
        'mock',
      );
    });

    it('should propagate errors from service', async () => {
      const req = { user: { userId: 1 } };
      const body = { amount: 100, gateway: 'binance' };

      paymentsService.createDeposit.mockRejectedValue(
        new BadRequestException('Payment gateway error'),
      );

      await expect(controller.createDeposit(req, body)).rejects.toThrow(
        'Payment gateway error',
      );
    });

    it('should handle different gateway types', async () => {
      const req = { user: { userId: 5 } };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 3,
        gatewayUrl: 'https://example.com',
        gatewayTxId: 'TX_MANUAL',
      });

      await controller.createDeposit(req, { amount: 200, gateway: 'manual' });
      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        5,
        200,
        'manual',
      );

      await controller.createDeposit(req, { amount: 300, gateway: 'stripe' });
      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        5,
        300,
        'stripe',
      );
    });

    it('should handle decimal amounts', async () => {
      const req = { user: { userId: 1 } };
      const body = { amount: 99.99, gateway: 'binance' };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 4,
        gatewayUrl: 'https://pay.binance.com',
        gatewayTxId: 'TX_DECIMAL',
      });

      await controller.createDeposit(req, body);

      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        1,
        99.99,
        'binance',
      );
    });

    it('should handle large amounts', async () => {
      const req = { user: { userId: 1 } };
      const body = { amount: 999999.99, gateway: 'binance' };

      paymentsService.createDeposit.mockResolvedValue({
        transactionId: 5,
        gatewayUrl: 'https://pay.binance.com',
        gatewayTxId: 'TX_LARGE',
      });

      await controller.createDeposit(req, body);

      expect(paymentsService.createDeposit).toHaveBeenCalledWith(
        1,
        999999.99,
        'binance',
      );
    });
  });
});
