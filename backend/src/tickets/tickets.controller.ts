import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() body: { subject: string; message: string; priority?: string },
  ) {
    return this.ticketsService.createTicket(
      req.user.userId,
      body.subject,
      body.message,
      body.priority,
    );
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.ticketsService.getUserTickets(req.user.userId);
  }

  // --- Admin Endpoints ---

  @Get('admin/all')
  findAllAdmin(@Request() req: RequestWithUser) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.ticketsService.getAllTickets();
  }

  @Get('admin/:id')
  findOneAdmin(@Request() req: RequestWithUser, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.ticketsService.getTicketAdmin(+id);
  }

  @Post('admin/:id/reply')
  replyAdmin(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { message: string; status?: string },
  ) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.ticketsService.adminReply(+id, body.message, body.status);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketsService.getTicket(req.user.userId, +id);
  }

  @Post(':id/message')
  reply(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.ticketsService.replyToTicket(req.user.userId, +id, message);
  }
}
