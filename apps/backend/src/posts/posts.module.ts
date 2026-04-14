import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [PostsController],
  providers: [PostsRepository, PostsService, JwtAuthGuard],
})
export class PostsModule {}
