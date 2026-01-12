import { Module } from '@nestjs/common';
import { ResellerService } from './reseller.service';
import { ResellerController } from './reseller.controller';
import { ResellerPublicController } from './reseller-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ResellerController, ResellerPublicController],
    providers: [ResellerService],
    exports: [ResellerService],
})
export class ResellerModule { }
