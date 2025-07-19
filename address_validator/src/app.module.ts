import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PreFlightService } from './pre-flight/pre-flight.service';
import { AddressController } from './address/address.controller';

@Module({
  imports: [],
  controllers: [AddressController],
  providers: [AppService, PreFlightService],
})
export class AppModule {}
