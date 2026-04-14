import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'eve.holt@reqres.in' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'cityslicka' })
  @IsString()
  @MinLength(1)
  password!: string;
}
