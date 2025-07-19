import { Test, TestingModule } from '@nestjs/testing';
import { PreFlightService } from './pre-flight.service';
import { BadRequestException } from '@nestjs/common';

describe('PreFlightService', () => {
  let service: PreFlightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreFlightService],
    }).compile();

    service = module.get<PreFlightService>(PreFlightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should throw an error if the address is too short', () => {
    expect(() => service.validateAddress('123')).toThrow(BadRequestException);
  });

  it('should return the address if it is valid', () => {
    expect(service.validateAddress('12345')).toBe('12345');
  });

  it('returns a lowercase address', () => {
    expect(service.validateAddress('Main Street')).toBe('main street');
  });

  it('returns a trimmed address', () => {
    expect(service.validateAddress('  Main Street  ')).toBe('main street');
  });
});
