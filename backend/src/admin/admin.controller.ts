import {
  Controller,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
  Body,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  async updateUser(
    @Request() req: { user: { role: string } },
    @Param('id') id: string,
    @Body() body: { balance?: number; role?: string },
  ) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.updateUser(Number(id), body);
  }

  // --- Announcements ---

  @Post('announcements')
  async createAnnouncement(
    @Request() req: { user: { role: string } },
    @Body() body: { message: string; type: string },
  ) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.createAnnouncement(body.message, body.type);
  }

  @Delete('announcements/:id')
  async deleteAnnouncement(
    @Request() req: { user: { role: string } },
    @Param('id') id: string,
  ) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.deleteAnnouncement(Number(id));
  }

  @Get('announcements/all')
  async getAllAnnouncements(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access only');
    return this.adminService.getAllAnnouncements();
  }

  @Get('announcements/active')
  async getActiveAnnouncements() {
    // Logged in users can see active announcements
    return this.adminService.getActiveAnnouncements();
  }
}
