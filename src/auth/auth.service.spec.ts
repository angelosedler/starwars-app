import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('changeme', 10);

    usersService = {
      findByUsername: jest.fn().mockImplementation((username: string) => {
        if (username === 'john') {
          return Promise.resolve({
            id: 'user-uuid',
            username: 'john',
            password: hashedPassword,
            role: 'regular',
          });
        }
        return Promise.resolve(null);
      }),
      createUser: jest.fn().mockResolvedValue({
        id: 'user-uuid',
        username: 'john',
        role: 'regular',
      }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should validate a valid user', async () => {
    const user = await authService.validateUser('john', 'changeme');
    expect(user).toEqual({
      id: 'user-uuid',
      username: 'john',
      role: 'regular',
    });
  });

  it('should return null for an invalid password', async () => {
    const user = await authService.validateUser('john', 'wrong');
    expect(user).toBeNull();
  });

  it('should issue a JWT token on login', async () => {
    const user = await authService.validateUser('john', 'changeme');
    const result = authService.login(user!);
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('should register a new user', async () => {
    const result = await authService.register('john', 'changeme');
    expect(result).toEqual({
      id: 'user-uuid',
      username: 'john',
      role: 'regular',
    });
  });
});
