import { Injectable } from '@nestjs/common';

@Injectable()
export class PreFlightService {
  validateAddress(address: string) {
    // At this point, the address is already sanitized and basic validation is done we know it's a string with reasonable length for an address
    console.log(address);
    // strip control characters / emoji to avoid noise
    // eslint-disable-next-line no-control-regex
    address = address.replace(/[\x00-\x1F\x7F-\x9F\u{1F300}-\u{1F9FF}]/gu, '');
    return address;
  }
}
