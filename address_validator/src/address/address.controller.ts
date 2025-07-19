import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ValidateAddressDto } from './dtos/validate-address.dto';
import { PreFlightPipe } from 'src/pre-flight/pre-flight.pipe';

@Controller('')
export class AddressController {
  @Post('validate-address')
  @UsePipes(new ValidationPipe({ transform: true }), PreFlightPipe)
  validateAddress(@Body() body: ValidateAddressDto) {
    console.log(body);
    return body;
  }
}
