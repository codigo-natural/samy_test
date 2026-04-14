import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReqresModule } from '../external/reqres/reqres.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [ReqresModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, JwtAuthGuard],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
