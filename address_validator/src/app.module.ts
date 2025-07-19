import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PreFlightService } from './pre-flight/pre-flight.service';
import { AddressController } from './address/address.controller';
import { AddressModule } from './address/address.module';

@Module({
  imports: [AddressModule],
  controllers: [AddressController],
  providers: [AppService, PreFlightService],
})
export class AppModule {}
