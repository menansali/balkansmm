import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { Request as ExpressRequest } from 'express';

type AuthRequest = ExpressRequest & { user: { userId: number } };

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Post('track')
    async trackProfile(
        @Request() req: AuthRequest,
        @Body() body: { platform: string; profileUrl: string },
    ) {
        return this.analyticsService.trackProfile(req.user.userId, body.platform, body.profileUrl);
    }

    @Get('profiles')
    async getTrackedProfiles(@Request() req: AuthRequest) {
        return this.analyticsService.getTrackedProfiles(req.user.userId);
    }

    @Get('profiles/:id')
    async getProfileAnalytics(
        @Request() req: AuthRequest,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.analyticsService.getProfileAnalytics(req.user.userId, id);
    }

    @Post('profiles/:id/refresh')
    async refreshProfileData(
        @Request() req: AuthRequest,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.analyticsService.refreshProfileData(req.user.userId, id);
    }

    @Delete('profiles/:id')
    async deleteProfile(
        @Request() req: AuthRequest,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.analyticsService.deleteTrackedProfile(req.user.userId, id);
    }

    @Get('compare')
    async compareProfiles(
        @Request() req: AuthRequest,
        @Query('ids') ids: string,
    ) {
        const profileIds = ids.split(',').map((id) => parseInt(id, 10));
        return this.analyticsService.compareProfiles(req.user.userId, profileIds);
    }
}
