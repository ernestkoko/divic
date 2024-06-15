import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginUserInput } from './dto/login-user.input';
import { LoginUserWithBiometric } from './dto/login-user-with-biometric.input';
import { JwtService } from '@nestjs/jwt';

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    loginWithBiometric: jest.fn(),
  };

  const mockContext = {
    user: {
      id: 1,
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        JwtService,
      ],
    }).compile();

    authResolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a LoginResponse', async () => {
      const loginResponse: LoginResponse = {
        token: 'testToken',
        user: {
          id: 1,
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockAuthService.login.mockResolvedValue(loginResponse);

      const loginUserInput: LoginUserInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const result = await authResolver.login(loginUserInput, { user: mockContext.user });
      expect(result).toEqual(loginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockContext.user);
    });
  });

  describe('loginWithBiometric', () => {
    it('should return a LoginResponse', async () => {
      const loginResponse: LoginResponse = {
        token: 'testToken',
        user: {
          id: 1,
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      mockAuthService.loginWithBiometric.mockResolvedValue(loginResponse);

      const loginUserWithBiometric: LoginUserWithBiometric = {
        biometricKey: 'biometricKey',
      };

      const result = await authResolver.loginWithBiometric(loginUserWithBiometric);
      expect(result).toEqual(loginResponse);
      expect(mockAuthService.loginWithBiometric).toHaveBeenCalledWith(loginUserWithBiometric);
    });
  });
});
