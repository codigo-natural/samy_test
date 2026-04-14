import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { title: string; body: string; authorUserId: number }): Promise<unknown> {
    return this.prisma.post.create({
      data,
    });
  }

  findById(id: string): Promise<unknown | null> {
    return this.prisma.post.findUnique({ where: { id } });
  }

  async list(page: number, limit: number): Promise<{ data: unknown[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count(),
    ]);

    return { data, total };
  }

  update(
    id: string,
    data: Partial<{ title: string; body: string; authorUserId: number }>,
  ): Promise<unknown> {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<unknown> {
    return this.prisma.post.delete({ where: { id } });
  }
}
