import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users.',
    type: [User],
    schema: {
      example: [{ id: 'uuid', username: 'john', role: 'regular' }],
    },
  })
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User found.',
    type: User,
    schema: {
      example: { id: 'uuid', username: 'john', role: 'regular' },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    if (!isUuid(id)) {
      throw new NotFoundException('User not found');
    }
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
