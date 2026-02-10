import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchedulerService } from './scheduler.service';
import { Request as ExpressRequest } from 'express';

type AuthRequest = ExpressRequest & { user: { userId: number } };

@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(private schedulerService: SchedulerService) {}

  @Post('posts')
  async createPost(@Request() req: AuthRequest, @Body() body: any) {
    return this.schedulerService.createScheduledPost(req.user.userId, body);
  }

  @Get('posts')
  async getPosts(
    @Request() req: AuthRequest,
    @Query('status') status?: string,
  ) {
    return this.schedulerService.getScheduledPosts(req.user.userId, status);
  }

  @Get('posts/:id')
  async getPost(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schedulerService.getPost(req.user.userId, id);
  }

  @Put('posts/:id')
  async updatePost(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.schedulerService.updatePost(req.user.userId, id, body);
  }

  @Post('posts/:id/cancel')
  async cancelPost(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schedulerService.cancelPost(req.user.userId, id);
  }

  @Delete('posts/:id')
  async deletePost(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schedulerService.deletePost(req.user.userId, id);
  }

  @Post('generate-caption')
  async generateCaption(
    @Body()
    body: {
      topic: string;
      tone: string;
      platform: string;
      includeEmojis: boolean;
      includeHashtags: boolean;
    },
  ) {
    return this.schedulerService.generateCaption(body);
  }

  @Get('calendar')
  async getCalendar(
    @Request() req: AuthRequest,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.schedulerService.getCalendarView(req.user.userId, month, year);
  }
}
