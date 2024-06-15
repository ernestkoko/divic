import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthUser } from '../auth/custom-decorators/authenticated-user-decorator';
import { CreateUseInput } from './dto/create.user.dto';
import { UpdateUserBiometricInput } from './dto/update-biometric.user.dto';
import { UserResponse } from './model/user.model';

describe('UserResolver', () => {
  let userResolver: UserResolver;
  let userService: UserService;

  const mockUserService = {
    register: jest.fn(),
    findUsers: jest.fn(),
    updateBiometric: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  const mockUserResponse = (): UserResponse => ({
    id: 1,
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockAuthUser: AuthUser = {
    id: 1,
    email: 'test@example.com',
  };

  describe('register', () => {
    it('should register a new user and return user response', async () => {
      const input: CreateUseInput = { email: 'test@example.com', password: 'password' };
      const userResponse = mockUserResponse();
      mockUserService.register.mockResolvedValue(userResponse);

      const result = await userResolver.register(input);
      expect(result).toEqual(userResponse);
      expect(mockUserService.register).toHaveBeenCalledWith(input);
    });
  });

  describe('users', () => {
    it('should return a list of users', async () => {
      const usersResponse: UserResponse[] = [mockUserResponse()];
      mockUserService.findUsers.mockResolvedValue(usersResponse);

      const result = await userResolver.users();
      expect(result).toEqual(usersResponse);
      expect(mockUserService.findUsers).toHaveBeenCalled();
    });
  });

  describe('user', () => {
    it('should return a list of users', async () => {
      const usersResponse: UserResponse[] = [mockUserResponse()];
      mockUserService.findUsers.mockResolvedValue(usersResponse);

      const result = await userResolver.user();
      expect(result).toEqual(usersResponse);
      expect(mockUserService.findUsers).toHaveBeenCalled();
    });
  });

  describe('updateBiometric', () => {
    it('should update user biometric and return user response', async () => {
      const input: UpdateUserBiometricInput = { biometricKey: 'newBiometricKey' };
      const userResponse = mockUserResponse();
      mockUserService.updateBiometric.mockResolvedValue(userResponse);

      const result = await userResolver.updateBiometric(input, mockAuthUser);
      expect(result).toEqual(userResponse);
      expect(mockUserService.updateBiometric).toHaveBeenCalledWith({ input, authUser: mockAuthUser });
    });
  });
});
