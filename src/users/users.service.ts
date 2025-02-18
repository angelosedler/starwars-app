import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(
    username: string,
    password: string,
    role: UserRole = UserRole.REGULAR,
  ): Promise<Omit<User, 'password'>> {
    try {
      const newUser = this.usersRepository.create({ username, password, role });
      const savedUser = await this.usersRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...rest } = savedUser;
      return rest;
    } catch (error) {
      // For Postgres + TypeORM, code '23505' typically means a unique constraint violation
      if (error.code === '23505') {
        throw new ConflictException('Username is already taken');
      }
      throw error;
    }
  }

  async updateUserRole(
    id: string,
    newRole: UserRole,
  ): Promise<Omit<User, 'password'> | null> {
    await this.usersRepository.update(id, { role: newRole });
    return this.findOne(id);
  }

  async updateUser(
    id: string,
    user: User,
  ): Promise<Omit<User, 'password'> | null> {
    await this.usersRepository.update(id, user);
    return this.findOne(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
