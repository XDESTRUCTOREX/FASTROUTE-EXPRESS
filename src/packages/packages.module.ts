import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './package.entity';
import { PackagesService } from './packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
