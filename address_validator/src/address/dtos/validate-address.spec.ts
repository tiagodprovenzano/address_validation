import { MAX_ADDRESS_LENGTH, MIN_ADDRESS_LENGTH } from '../../common/config';
import { ValidateAddressDto } from './validate-address.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ValidateAddressDto', () => {
  it('should throw error if smaller than minimum value', async () => {
    //create a string with MIN_ADDRESS_LENGTH - 1 characters
    const dto = {
      address: 'a'.repeat(MIN_ADDRESS_LENGTH - 1),
    };
    const dtoInstance = plainToInstance(ValidateAddressDto, dto);
    const errors = await validate(dtoInstance);
    const findMinLengthError = errors.find((error) => error.constraints);
    expect(findMinLengthError).toBeDefined();
    expect(findMinLengthError?.constraints).toBeDefined();
    expect(findMinLengthError?.constraints?.minLength).toBe(
      `Address must be at least ${MIN_ADDRESS_LENGTH} characters`,
    );
  });

  it('should throw error if larger than maximum value', async () => {
    const dto = {
      address: 'a'.repeat(MAX_ADDRESS_LENGTH + 1),
    };
    const dtoInstance = plainToInstance(ValidateAddressDto, dto);
    const errors = await validate(dtoInstance);
    const findMaxLengthError = errors.find((error) => error.constraints);
    expect(findMaxLengthError).toBeDefined();
    expect(findMaxLengthError?.constraints).toBeDefined();
    expect(findMaxLengthError?.constraints?.maxLength).toBe(
      `Address must be less than ${MAX_ADDRESS_LENGTH} characters`,
    );
  });

  it('should throw error if not a string', async () => {
    const dto = {
      address: 12345,
    };
    const dtoInstance = plainToInstance(ValidateAddressDto, dto);
    const errors = await validate(dtoInstance);
    const findStringError = errors.find((error) => error.constraints?.isString);
    expect(findStringError).toBeDefined();
    expect(findStringError?.constraints).toBeDefined();
    expect(findStringError?.constraints?.isString).toBe(
      'Address must be a string',
    );
  });

  it('should throw error if empty', async () => {
    const dto = {
      address: null,
    };
    const dtoInstance = plainToInstance(ValidateAddressDto, dto);
    const errors = await validate(dtoInstance);
    const findEmptyError = errors.find(
      (error) => error.constraints?.isNotEmpty,
    );
    expect(findEmptyError).toBeDefined();
    expect(findEmptyError?.constraints).toBeDefined();
    expect(findEmptyError?.constraints?.isNotEmpty).toBe(
      'Address must be provided',
    );
  });

  it('should transform to lowercase and trim', async () => {
    const dto = {
      address: '  Hello World  ',
    };
    const dtoInstance = plainToInstance(ValidateAddressDto, dto);
    const errors = await validate(dtoInstance);
    expect(dtoInstance.address).toBe('hello world');
    expect(errors.length).toBe(0);
  });
});
