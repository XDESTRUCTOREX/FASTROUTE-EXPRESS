import { Test, TestingModule } from '@nestjs/testing';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

describe('BranchesController', () => {
  let controller: BranchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [
        {
          provide: BranchesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BranchesController>(BranchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
