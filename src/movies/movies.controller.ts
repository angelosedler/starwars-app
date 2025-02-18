import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from '../users/user.entity';
@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({
    status: 200,
    description: 'List of movies.',
    schema: {
      example: [
        {
          id: '1',
          title: 'A New Hope',
          openingCrawl: 'It is a period of civil war.',
          director: 'George Lucas',
          releaseDate: '1977-05-25',
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while fetching movies.',
  })
  async findAll(): Promise<Movie[]> {
    try {
      return await this.moviesService.findAll();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to fetch movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.REGULAR)
  @ApiOperation({ summary: 'Get movie by id' })
  @ApiParam({
    name: 'id',
    description: 'Movie ID (derived from the film URL)',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie details.',
    schema: {
      example: {
        id: '1',
        title: 'A New Hope',
        openingCrawl: 'It is a period of civil war.',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie with ID 1 not found',
        },
        statusCode: {
          type: 'number',
          example: 404,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while fetching movie.',
  })
  async findOne(@Param('id') id: string): Promise<Movie> {
    try {
      const movie = await this.moviesService.findOne(id);
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      return movie;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new movie (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'The Empire Strikes Back' },
        openingCrawl: {
          type: 'string',
          example: 'It is a period of civil war.',
        },
        director: { type: 'string', example: 'Irvin Kershner' },
        releaseDate: { type: 'string', example: '1980-05-21' },
      },
      required: ['title'],
    },
    description: 'Note: externalId cannot be modified through this endpoint',
  })
  @ApiResponse({
    status: 201,
    description: 'Movie created.',
    schema: {
      example: {
        id: '2',
        title: 'The Empire Strikes Back',
        openingCrawl: 'It is a period of civil war.',
        director: 'Irvin Kershner',
        releaseDate: '1980-05-21',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie title is required',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while creating movie.',
  })
  async create(@Body() movieData: Partial<Movie>): Promise<Movie> {
    try {
      if (!movieData || Object.keys(movieData).length === 0) {
        throw new BadRequestException('Movie data is required');
      }
      if (!movieData.title) {
        throw new BadRequestException('Movie title is required');
      }
      return await this.moviesService.create(movieData);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an existing movie (admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        openingCrawl: {
          type: 'string',
          example: 'It is a period of civil war.',
        },
        director: { type: 'string', example: 'Updated Director' },
        releaseDate: { type: 'string', example: '2025-01-01' },
      },
    },
    description: 'Note: externalId cannot be modified through this endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie updated.',
    schema: {
      example: {
        id: '1',
        title: 'Updated Title',
        openingCrawl: 'It is a period of civil war.',
        director: 'Updated Director',
        releaseDate: '2025-01-01',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie data is required for update',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie with ID 1 not found',
        },
        statusCode: {
          type: 'number',
          example: 404,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while updating movie.',
  })
  async update(
    @Param('id') id: string,
    @Body() movieData: Partial<Movie>,
  ): Promise<Movie> {
    try {
      if (!movieData || Object.keys(movieData).length === 0) {
        throw new BadRequestException('Movie data is required for update');
      }
      const updatedMovie = await this.moviesService.update(id, movieData);
      if (!updatedMovie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      return updatedMovie;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to update movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a movie (admin only)' })
  @ApiParam({ name: 'id', description: 'Movie ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Movie deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Movie with ID 1 not found',
        },
        statusCode: {
          type: 'number',
          example: 404,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while deleting movie.',
  })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const movie = await this.moviesService.findOne(id);
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      await this.moviesService.delete(id);
      return { message: 'Movie deleted.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Manually sync movies from the Star Wars API (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Movies synced successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while syncing movies.',
  })
  async syncMovies(): Promise<{ message: string }> {
    try {
      await this.moviesService.syncMovies();
      return { message: 'Movies synced successfully.' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Failed to sync movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
