import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('my-bookings')
  findMyBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Request() req) {
    return this.bookingsService.update(id, updateBookingDto, req.user.sub);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirm(id, req.user.sub);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user.sub);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Request() req) {
    return this.bookingsService.complete(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.bookingsService.remove(id, req.user.sub);
  }
}
