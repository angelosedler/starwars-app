import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Movie {
  // Use the film's id from the URL (e.g. "1" from "https://swapi.info/api/films/1")
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  externalId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  openingCrawl: string;

  @Column({ nullable: true })
  director: string;

  @Column({ nullable: true })
  releaseDate: string;
}
