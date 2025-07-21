import { Module } from '@nestjs/common';
import { ParserService } from 'src/parser/parser.service';
import { PreFlightPipe } from 'src/pre-flight/pre-flight.pipe';
import { PreFlightService } from 'src/pre-flight/pre-flight.service';

@Module({})
export class AddressModule {
  providers: [PreFlightService, PreFlightPipe, ParserService];
}
