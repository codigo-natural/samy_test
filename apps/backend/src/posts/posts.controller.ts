import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201 })
  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @ApiOperation({ summary: 'List posts (paginated)' })
  @ApiResponse({ status: 200 })
  @Get()
  list(@Query() pagination: PaginationDto) {
    return this.postsService.list(pagination);
  }

  @ApiOperation({ summary: 'Get post by id' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200 })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete post (admin only)' })
  @ApiResponse({ status: 204 })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.postsService.delete(id);
  }
}
