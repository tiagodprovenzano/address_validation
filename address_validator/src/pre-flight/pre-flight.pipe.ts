import { Injectable, PipeTransform } from '@nestjs/common';
import { PreFlightService } from './pre-flight.service';
import { ValidateAddressDto } from 'src/address/dtos/validate-address.dto';

@Injectable()
export class PreFlightPipe
  implements PipeTransform<ValidateAddressDto, string>
{
  constructor(private readonly preFlightService: PreFlightService) {}
  transform(rawAddress: ValidateAddressDto) {
    return this.preFlightService.validateAddress(rawAddress.address);
  }
}
