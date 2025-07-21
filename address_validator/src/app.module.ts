import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PreFlightService } from './pre-flight/pre-flight.service';
import { AddressController } from './address/address.controller';
import { AddressModule } from './address/address.module';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [AddressModule, ParserModule],
  controllers: [AddressController],
  providers: [AppService, PreFlightService],
})
export class AppModule {}
