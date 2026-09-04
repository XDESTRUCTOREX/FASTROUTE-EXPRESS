import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConductoresClientesModule } from './conductores-clientes/conductores-clientes.module';

@Module({
  imports: [ConductoresClientesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
