import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), ScheduleModule.forRoot()],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
