import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQuery } from '../common/interfaces/paginated-response.interface';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.transferCredits(createTransactionDto);
  }

  @Get()
  findAll(@Query() query: PaginationQuery) {
    return this.transactionsService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query() query: PaginationQuery) {
    return this.transactionsService.findByUser(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}
