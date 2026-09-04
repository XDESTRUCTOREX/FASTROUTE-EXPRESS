import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PackageModule } from './package/package.module';

@Module({
  imports: [PackageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
