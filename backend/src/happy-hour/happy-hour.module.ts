import { Module } from '@nestjs/common';
import { HappyHourService } from './happy-hour.service';
import { HappyHourController } from './happy-hour.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [HappyHourController],
    providers: [HappyHourService],
    exports: [HappyHourService],
})
export class HappyHourModule { }
