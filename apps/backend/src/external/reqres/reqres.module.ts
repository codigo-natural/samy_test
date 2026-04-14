import { Module } from '@nestjs/common';
import { ReqresService } from './reqres.service';

@Module({
  providers: [ReqresService],
  exports: [ReqresService],
})
export class ReqresModule {}
