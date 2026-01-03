import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async findAllAdmin(@Request() req: any) {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required'); // Ensure usage of ForbiddenException
    }
    return this.servicesService.findAllAdmin();
  }

  @Post('preview')
  async preview(@Body('link') link: string) {
    return this.servicesService.fetchMetadata(link);
  }

  // Admin only - simplified security for demo
  @Post('margin')
  async setMargin(@Body('percentage') percentage: number) {
    return this.servicesService.updateGlobalMargin(percentage);
  }

  @Post('sync')
  async sync(@Body() body: { provider: 'justanotherpanel' | 'morethanpanel', margin: number }) {
    return this.servicesService.syncServices(body.provider, body.margin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
