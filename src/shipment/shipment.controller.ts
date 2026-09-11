import { Controller, Get, Query } from '@nestjs/common';
import { ShipmentQueryDto } from './dto/shipment-query.dto';
import { ShipmentService } from './shipment.service';

@Controller('shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Get()
  findAll(@Query() query: ShipmentQueryDto) {
    return this.shipmentService.findAll(query);
  }
}
