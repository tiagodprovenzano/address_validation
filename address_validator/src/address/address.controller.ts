import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ParserService } from 'src/parser/parser.service';
import { AddressValidationService } from './address-validation.service';
import { ValidationResult } from 'src/types/address-validation';
import { ValidateAddressDto } from './dtos/validate-address.dto';

@Controller('')
export class AddressController {
  constructor(
    private readonly parserService: ParserService,
    private readonly validationService: AddressValidationService,
  ) {}
  @Post('validate-address')
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateAddress(@Body() dto: ValidateAddressDto): Promise<{
    components: Record<string, string>;
    validation: ValidationResult;
  }> {
    console.log('validateAddress called for:', dto);
    // Manual sanitization (same as PreFlightService)
    const sanitizedAddress = dto.address.replace(
      // eslint-disable-next-line no-control-regex
      /[\x00-\x1F\x7F-\x9F\u{1F300}-\u{1F9FF}]/gu,
      '',
    );

    console.log('Starting validation for:', sanitizedAddress);
    const parsed = await this.parserService.parse(sanitizedAddress);
    console.log('Parsed components:', parsed.components);

    try {
      console.log('Calling validation service...');
      const validation =
        await this.validationService.validate(sanitizedAddress);
      console.log('Validation result:', validation);
      return { components: parsed.components, validation };
    } catch (error) {
      console.error('Validation service error:', error);
      // Return without validation if service fails
      return {
        components: parsed.components,
        validation: {
          valid: false,
          similarity: 0,
          status: 'unverifiable' as any,
        },
      };
    }
  }

  @Post('test-validation')
  async testValidation(
    @Body() dto: ValidateAddressDto,
  ): Promise<ValidationResult> {
    console.log('Test validation called for:', dto.address);
    try {
      const result = await this.validationService.validate(dto.address);
      console.log('Test validation result:', result);
      return result;
    } catch (error) {
      console.error('Test validation error:', error);
      throw error;
    }
  }

  @Post('simple-validate')
  async simpleValidate(@Body() dto: ValidateAddressDto): Promise<{
    components: Record<string, string>;
    validation: ValidationResult;
  }> {
    console.log('Simple validate called for:', dto.address);

    try {
      // Parse with libpostal
      const parsed = await this.parserService.parse(dto.address);
      console.log('Parsed:', parsed.components);

      // Validate with DeepSeek + Google
      const validation = await this.validationService.validate(dto.address);
      console.log('Validation:', validation);

      return { components: parsed.components, validation };
    } catch (error) {
      console.error('Simple validate error:', error);
      throw error;
    }
  }
}
