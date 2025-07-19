import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;
}
