import { Test, TestingModule } from '@nestjs/testing';
import { ConductoresService } from './conductores.service';

describe('ConductoresService', () => {
  let service: ConductoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConductoresService],
    }).compile();

    service = module.get<ConductoresService>(ConductoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
