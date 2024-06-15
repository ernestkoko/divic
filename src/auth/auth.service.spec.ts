import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { LoginResponse } from './dto/login-response';
import { User } from '@prisma/client';
import { LoginUserWithBiometric } from './dto/login-user-with-biometric.input';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            findUsers: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);
      await expect(authService.validateUser({ email: 'test@example.com', password: 'password' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user has no password', async () => {
      const user = { email: 'test@example.com', password: null } as User;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      await expect(authService.validateUser({ email: 'test@example.com', password: 'password' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const user = { email: 'test@example.com', password: 'hashedpassword' } as User;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(authService.validateUser({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(BadRequestException);
    });

    it('should return user if email and password are correct', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword' } as User;
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await authService.validateUser({ email: 'test@example.com', password: 'password' });
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });
  });

  describe('login', () => {
    it('should return a valid token and user', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const token = 'some.jwt.token';
      jest.spyOn(authService, 'signPayload').mockResolvedValue(token);

      const result = await authService.login(user);
      expect(result).toEqual({ token, user });
    });
  });

  describe('loginWithBiometric', () => {
    it('should return a valid token and user if biometricKey matches', async () => {
      const user = { id: 1, email: 'test@example.com', biometricKey: await bcrypt.hash('biometricKey123', 10) } as User;
      const users = [user];
      const input: LoginUserWithBiometric = { biometricKey: 'biometricKey123' };
      const token = 'some.jwt.token';

      jest.spyOn(userService, 'findUsers').mockResolvedValue(users);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(authService, 'signPayload').mockResolvedValue(token);

      const result = await authService.loginWithBiometric(input);
      expect(result).toEqual({ token, user });
    });

    it('should throw BadRequestException if biometricKey does not match', async () => {
      const user = { id: 1, email: 'test@example.com', biometricKey: await bcrypt.hash('biometricKey123', 10) } as User;
      const users = [user];
      const input: LoginUserWithBiometric = { biometricKey: 'wrongBiometricKey' };

      jest.spyOn(userService, 'findUsers').mockResolvedValue(users);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.loginWithBiometric(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no user with matching biometricKey is found', async () => {
      const users = [];
      const input: LoginUserWithBiometric = { biometricKey: 'biometricKey123' };

      jest.spyOn(userService, 'findUsers').mockResolvedValue(users);

      await expect(authService.loginWithBiometric(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('signPayload', () => {
    it('should return a valid JWT token', async () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = 'some.jwt.token';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.signPayload(payload);
      expect(result).toBe(token);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const payload = { id: 1, email: 'test@example.com' };

      jest.spyOn(jwtService, 'signAsync').mockRejectedValue(new Error());

      await expect(authService.signPayload(payload)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
