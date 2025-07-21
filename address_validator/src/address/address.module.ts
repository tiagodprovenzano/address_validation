import { Module } from '@nestjs/common';
import { ParserModule } from 'src/parser/parser.module';
import { PreFlightPipe } from 'src/pre-flight/pre-flight.pipe';
import { PreFlightService } from 'src/pre-flight/pre-flight.service';
import { AddressValidationService } from './address-validation.service';
import { AddressController } from './address.controller';

@Module({
  imports: [ParserModule],
  controllers: [AddressController],
  providers: [PreFlightService, PreFlightPipe, AddressValidationService],
  exports: [AddressValidationService],
})
export class AddressModule {}
