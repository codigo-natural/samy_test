import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PostsRepository } from './posts.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: CreatePostDto) {
    const author = await this.usersRepository.findById(dto.authorUserId);
    if (!author) {
      throw new BadRequestException('authorUserId must be a locally saved user');
    }

    return this.postsRepository.create({
      title: dto.title,
      body: dto.body,
      authorUserId: dto.authorUserId,
    });
  }

  async list(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const { data, total } = await this.postsRepository.list(page, limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (dto.authorUserId !== undefined) {
      const author = await this.usersRepository.findById(dto.authorUserId);
      if (!author) {
        throw new BadRequestException('authorUserId must be a locally saved user');
      }
    }

    return this.postsRepository.update(id, {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.body !== undefined ? { body: dto.body } : {}),
      ...(dto.authorUserId !== undefined
        ? { authorUserId: dto.authorUserId }
        : {}),
    });
  }

  async delete(id: string) {
    const existing = await this.postsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.delete(id);
  }
}
