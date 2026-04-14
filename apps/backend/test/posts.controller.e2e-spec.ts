import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PostsController } from '../src/posts/posts.controller';
import { PostsService } from '../src/posts/posts.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  const postsService = {
    list: jest.fn(),
  } as unknown as PostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: postsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { sub: 'test@test.com', role: 'ADMIN' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /posts returns paginated shape', async () => {
    (postsService.list as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer())
      .get('/posts?page=1&limit=10')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      });
  });
});
