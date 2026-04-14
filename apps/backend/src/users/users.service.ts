import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReqresService } from '../external/reqres/reqres.service';
import { UsersRepository } from './users.repository';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SaveUserDto } from './dto/save-user.dto';
import { Role } from '../common/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly reqresService: ReqresService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async importUser(id: number, requestId?: string, dto?: SaveUserDto): Promise<{ user: unknown; alreadyExisted: boolean }> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid id');
    }

    const existing = await this.usersRepository.findById(id);

    const reqresUser = await this.reqresService.getUser(id, requestId);

    const role: Role = dto?.role ?? 'VIEWER';

    const saved = await this.usersRepository.upsert({
      id: reqresUser.id,
      email: reqresUser.email,
      firstName: reqresUser.first_name,
      lastName: reqresUser.last_name,
      avatar: reqresUser.avatar,
      role,
    });

    return { user: saved, alreadyExisted: Boolean(existing) };
  }

  async getSavedUsers(pagination: PaginationDto): Promise<{ data: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const { data, total } = await this.usersRepository.list(page, limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSavedUser(id: number): Promise<unknown> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  deleteSavedUser(id: number): Promise<unknown> {
    return this.usersRepository.deleteById(id);
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto): Promise<unknown> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.updateRole(id, dto.role);
  }

  async getRoleByEmail(email: string): Promise<Role> {
    const user = await this.usersRepository.findByEmail(email);
    return (user?.role as Role | undefined) ?? 'VIEWER';
  }
}
