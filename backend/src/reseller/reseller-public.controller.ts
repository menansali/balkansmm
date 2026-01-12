import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Headers,
} from '@nestjs/common';
import { ResellerService } from './reseller.service';

@Controller('store')
export class ResellerPublicController {
    constructor(private resellerService: ResellerService) { }

    @Get(':slug')
    async getStore(@Param('slug') slug: string) {
        return this.resellerService.getStoreBySlug(slug);
    }

    @Get(':slug/services')
    async getServices(@Param('slug') slug: string) {
        return this.resellerService.getStoreServices(slug);
    }

    @Post(':slug/register')
    async register(
        @Param('slug') slug: string,
        @Body() body: { email: string; password: string; name?: string },
    ) {
        return this.resellerService.registerCustomer(slug, body);
    }

    @Post(':slug/login')
    async login(
        @Param('slug') slug: string,
        @Body() body: { email: string; password: string },
    ) {
        return this.resellerService.loginCustomer(slug, body.email, body.password);
    }

    @Post(':slug/orders')
    async createOrder(
        @Param('slug') slug: string,
        @Headers('x-customer-id') customerId: string,
        @Body() body: { serviceId: number; link: string; quantity: number },
    ) {
        return this.resellerService.createCustomerOrder(
            slug,
            parseInt(customerId, 10),
            body,
        );
    }

    @Get(':slug/orders')
    async getOrders(
        @Param('slug') slug: string,
        @Headers('x-customer-id') customerId: string,
    ) {
        return this.resellerService.getCustomerOrders(slug, parseInt(customerId, 10));
    }
}
