import { Repository } from 'typeorm';
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
import { BranchesService } from './branches.service';
import { Branch } from './branch.entity';

describe('BranchesService', () => {
  let service: BranchesService;
  let repository: jest.Mocked<Partial<Repository<Branch>>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    service = new BranchesService(repository as Repository<Branch>);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
