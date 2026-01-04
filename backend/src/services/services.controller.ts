import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() createServiceDto: CreateServiceDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async findAllAdmin(@Request() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin access required');
    return this.servicesService.findAllAdmin();
  }

  @Post('preview')
  async preview(@Body('link') link: string) {
    return this.servicesService.fetchMetadata(link);
  }

  @Post('margin')
  @UseGuards(JwtAuthGuard)
  async setMargin(@Request() req: any, @Body('percentage') percentage: number) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.servicesService.updateGlobalMargin(percentage);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(@Request() req: any, @Body() body: { provider: 'justanotherpanel' | 'morethanpanel', margin: number }) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.servicesService.syncServices(body.provider, body.margin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.servicesService.remove(+id);
  }
}
