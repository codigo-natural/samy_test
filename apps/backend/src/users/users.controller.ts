import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SaveUserDto } from './dto/save-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Import a user from ReqRes and save locally' })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('import/:id')
  importUser(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveUserDto,
  ): Promise<{ user: unknown; alreadyExisted: boolean }> {
    const requestId = (req as Request & { requestId?: string }).requestId;
    return this.usersService.importUser(id, requestId, dto);
  }

  @ApiOperation({ summary: 'List locally saved users (paginated)' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  getSavedUsers(@Query() pagination: PaginationDto) {
    return this.usersService.getSavedUsers(pagination);
  }

  @ApiOperation({ summary: 'Get locally saved user by id' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('saved/:id')
  getSavedUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getSavedUser(id);
  }

  @ApiOperation({ summary: 'Delete a saved user (admin only)' })
  @ApiResponse({ status: 204 })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('saved/:id')
  async deleteSavedUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.deleteSavedUser(id);
  }

  @ApiOperation({ summary: 'Update a saved user role (admin only)' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('saved/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, dto);
  }
}
