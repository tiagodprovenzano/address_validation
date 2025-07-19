import { Body, Controller, Post } from '@nestjs/common';
import { ValidateAddressDto } from './dtos/validate-address.dto';

@Controller('')
export class AddressController {
  @Post('validate-address')
  validateAddress(@Body() body: ValidateAddressDto) {
    return body;
  }
}
