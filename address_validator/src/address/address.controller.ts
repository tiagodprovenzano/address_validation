import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PreFlightPipe } from 'src/pre-flight/pre-flight.pipe';
import { ParserService } from 'src/parser/parser.service';

@Controller('')
export class AddressController {
  constructor(private readonly parserService: ParserService) {}
  @Post('validate-address')
  @UsePipes(new ValidationPipe({ transform: true }), PreFlightPipe)
  async validateAddress(@Body() sanitizedAddress: string): Promise<{
    components: Record<string, string>;
  }> {
    return await this.parserService.parse(sanitizedAddress);
  }
}
