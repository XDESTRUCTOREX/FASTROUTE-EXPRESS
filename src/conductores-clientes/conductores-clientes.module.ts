import { Module } from '@nestjs/common';
import { ConductoresService } from './conductores/conductores.service';

@Module({
  providers: [ConductoresService]
})
export class ConductoresClientesModule {}
