import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PreFlightService } from './pre-flight/pre-flight.service';
import { AddressModule } from './address/address.module';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [AddressModule, ParserModule],
  providers: [AppService, PreFlightService],
})
export class AppModule {}
