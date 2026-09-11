import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BranchesModule } from './branches/branches.module';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';
import { PackagesModule } from './packages/packages.module';
import { ShipmentsModule } from './shipments/shipments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'fastroute'),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true' &&
          configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    BranchesModule,
    DriversModule,
    CustomersModule,
    PackagesModule,
    ShipmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
