import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/user.entity';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, plainPassword: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const match = await bcrypt.compare(plainPassword, user.password);
    if (!match) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  login(user: UserWithoutPassword) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(username: string, plainPassword: string, role = 'regular') {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    const newUser = await this.usersService.createUser(
      username,
      hashedPassword,
      role as UserRole,
    );
    return newUser;
  }
}
