import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { Role } from '../../common/guards/roles.guard';

export class SaveUserDto {
  @ApiPropertyOptional({ enum: ['VIEWER', 'EDITOR', 'ADMIN'], default: 'VIEWER' })
  @IsOptional()
  @IsIn(['VIEWER', 'EDITOR', 'ADMIN'])
  role?: Role;
}
