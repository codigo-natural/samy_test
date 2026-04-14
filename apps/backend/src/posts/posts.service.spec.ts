import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { UsersRepository } from '../users/users.repository';

describe('PostsService', () => {
  let service: PostsService;

  const postsRepository = {
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as PostsRepository;

  const usersRepository = {
    findById: jest.fn(),
  } as unknown as UsersRepository;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostsRepository, useValue: postsRepository },
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  it('throws when creating a post with non-saved authorUserId', async () => {
    (usersRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({ title: 't', body: 'body body body', authorUserId: 123 } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(postsRepository.create).not.toHaveBeenCalled();
  });

  it('updates only provided fields and validates authorUserId', async () => {
    (postsRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1' });
    (usersRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (postsRepository.update as jest.Mock).mockResolvedValue({ id: 'p1', title: 'x' });

    await service.update('p1', { authorUserId: 1 } as any);

    expect(usersRepository.findById).toHaveBeenCalledWith(1);
    expect(postsRepository.update).toHaveBeenCalledWith('p1', { authorUserId: 1 });
  });

  it('does not pass unspecified fields when updating title only', async () => {
    (postsRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1' });
    (postsRepository.update as jest.Mock).mockResolvedValue({ id: 'p1', title: 'new' });

    await service.update('p1', { title: 'new' } as any);

    expect(usersRepository.findById).not.toHaveBeenCalled();
    expect(postsRepository.update).toHaveBeenCalledWith('p1', { title: 'new' });
  });

  it('delete throws NotFound when post does not exist', async () => {
    (postsRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
