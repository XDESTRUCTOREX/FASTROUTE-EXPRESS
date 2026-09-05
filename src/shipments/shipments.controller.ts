import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  // Ejemplo: /shipments?page=1&limit=10&customerId=1&branchId=2&date=2025-05-10
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('branchId') branchId?: string,
    @Query('date') date?: string,
  ) {
    return this.shipmentsService.findAllPaginated(
      Number(page) || 1,
      Number(limit) || 10,
      {
        customerId: customerId ? Number(customerId) : undefined,
        branchId: branchId ? Number(branchId) : undefined,
        date: date || undefined,
      },
    );
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findDetail(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}