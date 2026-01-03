import { Injectable, Logger } from '@nestjs/common';
import { SmmProvider } from './provider.interface';
import axios from 'axios';

@Injectable()
export class MoreThanPanelProvider implements SmmProvider {
    private readonly logger = new Logger(MoreThanPanelProvider.name);
    private apiUrl = process.env.MTP_URL || 'https://morethanpanel.com/api/v2';
    private apiKey = process.env.MTP_API_KEY;

    async getServices(): Promise<any[]> {
        try {
            const response = await axios.post(this.apiUrl, {
                key: this.apiKey,
                action: 'services',
            });
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get services', error);
            return [];
        }
    }

    async createOrder(serviceId: string | number, link: string, quantity: number, runs?: number, interval?: number): Promise<any> {
        try {
            const payload: any = {
                key: this.apiKey,
                action: 'add',
                service: serviceId,
                link,
                quantity,
            };
            // Drip Feed support
            if (runs && interval) {
                payload.runs = runs;
                payload.interval = interval;
            }

            const response = await axios.post(this.apiUrl, payload);

            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data;
        } catch (error) {
            this.logger.error('Failed to create order', error);
            throw error; // Rethrow to handle in service
        }
    }

    async getOrderStatus(orderId: string | number): Promise<any> {
        try {
            const response = await axios.post(this.apiUrl, {
                key: this.apiKey,
                action: 'status',
                order: orderId,
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get status for ${orderId}`, error);
            return {};
        }
    }

    async refill(orderId: string | number): Promise<any> {
        try {
            const response = await axios.post(this.apiUrl, {
                key: this.apiKey,
                action: 'refill',
                order: orderId,
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Refill failed for ${orderId}`, error);
            return { error: error.message };
        }
    }
}
