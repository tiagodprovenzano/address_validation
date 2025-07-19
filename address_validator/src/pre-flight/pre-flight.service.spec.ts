import { Test, TestingModule } from '@nestjs/testing';
import { PreFlightService } from './pre-flight.service';

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
});
