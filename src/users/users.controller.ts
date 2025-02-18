import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Body,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { Roles } from 'src/auth/roles.decorator';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update a user's role (admin only)" })
  @ApiParam({ name: 'id', description: 'User ID (UUID)', example: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          example: UserRole.ADMIN,
          description: 'New role for the user (admin or regular)',
          enum: [UserRole],
        },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully.',
    schema: { example: { id: 'uuid', username: 'john', role: UserRole.ADMIN } },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Invalid role provided.' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') newRole: UserRole,
  ): Promise<Omit<User, 'password'>> {
    if (!Object.values(UserRole).includes(newRole)) {
      throw new BadRequestException(
        `Invalid role. Valid roles are: ${Object.values(UserRole).join(', ')}`,
      );
    }

    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.usersService.updateUserRole(id, newRole);
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user role');
    }
    return updatedUser;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users.',
    schema: {
      example: [{ id: 'uuid', username: 'john', role: 'regular' }],
    },
  })
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({
    status: 200,
    description: 'User found.',
    schema: {
      example: { id: 'uuid', username: 'john', role: 'regular' },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(
    @Param('id') id: string,
  ): Promise<Omit<User, 'password'> | null> {
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
