import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ReqresModule } from '../external/reqres/reqres.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ReqresModule, UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
