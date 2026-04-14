import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(user: Prisma.UserCreateInput & { id: number }): Promise<User> {
    return this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      },
      create: user,
    });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async list(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { savedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return { data, total };
  }

  deleteById(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  updateRole(id: number, role: Prisma.UserUpdateInput['role']): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
