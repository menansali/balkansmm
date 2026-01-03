import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JustAnotherPanelProvider } from '../providers/justanotherpanel.provider';
import { MoreThanPanelProvider } from '../providers/morethanpanel.provider';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController],
  providers: [ServicesService, JustAnotherPanelProvider, MoreThanPanelProvider],
})
export class ServicesModule { }
