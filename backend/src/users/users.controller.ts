import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Helper to enforce admin only
  private checkAdmin(req: RequestWithUser) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Admin access required');
  }

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    this.checkAdmin(req);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    this.checkAdmin(req);
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    // Users can see their own profile, Admins can see any
    if (req.user.role !== 'admin' && req.user.userId !== +id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ) {
    // Only admins can update other users (e.g. balance/role)
    // Users might be able to update their own password (future)
    this.checkAdmin(req);
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    this.checkAdmin(req);
    return this.usersService.remove(+id);
  }
}
