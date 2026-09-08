import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create(dto);
    return this.branchRepository.save(branch);
  }

  findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }
    return branch;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<{ message: string }> {
    const branch = await this.findOne(id);
    try {
      await this.branchRepository.remove(branch);
      return { message: `Sucursal "${branch.name}" eliminada correctamente` };
    } catch {
      throw new ConflictException('No se puede eliminar: la sucursal tiene envios asociados');
    }
  }
}