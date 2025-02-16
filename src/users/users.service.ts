import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(
    username: string,
    password: string,
    role: UserRole = 'regular',
  ): Promise<User> {
    const newUser = this.usersRepository.create({ username, password, role });
    return this.usersRepository.save(newUser);
  }

  async updateUser(id: string, user: User): Promise<User | null> {
    await this.usersRepository.update(id, user);
    return this.findOne(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
