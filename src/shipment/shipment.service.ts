import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ShipmentQueryDto } from './dto/shipment-query.dto';
import { Shipment } from './entities/shipment.entity';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  async findAll(query: ShipmentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const builder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.originBranch', 'originBranch')
      .leftJoinAndSelect('shipment.destinationBranch', 'destinationBranch');

    this.applyFilters(builder, query);

    const [data, total] = await builder
      .orderBy('shipment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private applyFilters(
    builder: SelectQueryBuilder<Shipment>,
    query: ShipmentQueryDto,
  ) {
    if (query.client) {
      builder.andWhere('LOWER(shipment.clientName) LIKE LOWER(:client)', {
        client: `%${query.client}%`,
      });
    }
    if (query.from) {
      builder.andWhere('shipment.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      builder.andWhere('shipment.createdAt <= :to', { to: query.to });
    }
    if (query.originBranchId) {
      builder.andWhere('originBranch.id = :originBranchId', {
        originBranchId: query.originBranchId,
      });
    }
  }
}
