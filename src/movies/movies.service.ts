import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Movie } from './movie.entity';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(): Promise<Movie[]> {
    try {
      return await this.moviesRepository.find();
    } catch (error) {
      this.logger.error('Error fetching all movies', error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Movie | null> {
    try {
      return await this.moviesRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error fetching movie with id ${id}`, error.stack);
      throw error;
    }
  }

  async create(movieData: Partial<Movie>): Promise<Movie> {
    try {
      const { externalId, ...safeMovieData } = movieData; // eslint-disable-line @typescript-eslint/no-unused-vars
      const movie = this.moviesRepository.create(safeMovieData);
      return await this.moviesRepository.save(movie);
    } catch (error) {
      this.logger.error('Error creating movie', error.stack);
      throw error;
    }
  }

  async update(id: string, movieData: Partial<Movie>): Promise<Movie | null> {
    try {
      const { externalId, ...safeMovieData } = movieData; // eslint-disable-line @typescript-eslint/no-unused-vars
      await this.moviesRepository.update(id, safeMovieData);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Error updating movie with id ${id}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.moviesRepository.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting movie with id ${id}`, error.stack);
      throw error;
    }
  }

  async syncMovies(): Promise<void> {
    try {
      const response = await axios.get('https://swapi.info/api/films');
      const films = response.data;
      for (const film of films) {
        const parts = film.url.split('/');
        const filmId = parts[parts.length - 1] || parts[parts.length - 2];
        const movieData: Partial<Movie> = {
          externalId: filmId,
          title: film.title,
          director: film.director,
          releaseDate: film.release_date,
          openingCrawl: film.opening_crawl,
        };
        const existing = await this.moviesRepository.findOne({
          where: { externalId: filmId },
        });
        if (existing) {
          await this.moviesRepository.update(existing.id, movieData);
        } else {
          await this.moviesRepository.save(movieData);
        }
      }
      this.logger.log('Movies synced successfully');
    } catch (error) {
      this.logger.error('Failed to sync movies', error);
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  handleCron() {
    this.logger.log('Running scheduled movie sync');
    this.syncMovies(); // eslint-disable-line @typescript-eslint/no-floating-promises
  }
}
