import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_ADDRESS_LENGTH, MIN_ADDRESS_LENGTH } from '../../common/config';

export class ValidateAddressDto {
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address must be provided' })
  //must have at least MIN_ADDRESS_LENGTH characters
  @MinLength(MIN_ADDRESS_LENGTH, {
    message: `Address must be at least ${MIN_ADDRESS_LENGTH} characters`,
  })
  @MaxLength(MAX_ADDRESS_LENGTH, {
    message: `Address must be less than ${MAX_ADDRESS_LENGTH} characters`,
  })
  @Transform(({ value }: { value: string }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    return value;
  })
  address: string;
}
