import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(createServiceDto, req.user.userId);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.servicesService.findByCategory(category);
    }
    return this.servicesService.findAll();
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard)
  findMyServices(@Request() req) {
    return this.servicesService.findByProvider(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req) {
    return this.servicesService.update(id, updateServiceDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.userId);
  }
}
