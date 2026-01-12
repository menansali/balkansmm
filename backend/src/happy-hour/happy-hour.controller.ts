import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HappyHourService } from './happy-hour.service';

@Controller('happy-hour')
export class HappyHourController {
    constructor(private happyHourService: HappyHourService) { }

    // Public: Get active happy hour for frontend
    @Get('active')
    async getActiveHappyHour() {
        return this.happyHourService.getActiveHappyHour();
    }

    // Admin: Get all happy hours
    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllHappyHours() {
        return this.happyHourService.getAllHappyHours();
    }

    // Admin: Create happy hour
    @Post()
    @UseGuards(JwtAuthGuard)
    async createHappyHour(@Body() body: any) {
        return this.happyHourService.createHappyHour(body);
    }

    // Admin: Update happy hour
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateHappyHour(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.happyHourService.updateHappyHour(id, body);
    }

    // Admin: Delete happy hour
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteHappyHour(@Param('id', ParseIntPipe) id: number) {
        return this.happyHourService.deleteHappyHour(id);
    }

    // Admin: Toggle happy hour
    @Post(':id/toggle')
    @UseGuards(JwtAuthGuard)
    async toggleHappyHour(@Param('id', ParseIntPipe) id: number) {
        return this.happyHourService.toggleHappyHour(id);
    }
}
