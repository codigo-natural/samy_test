import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../common/guards/roles.guard';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['VIEWER', 'EDITOR', 'ADMIN'], required: true })
  @IsEnum(['VIEWER', 'EDITOR', 'ADMIN'])
  role!: Role;
}
