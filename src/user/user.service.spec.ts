import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '../utils/helper';
import { CreateUseInput } from './dto/create.user.dto';
import { UpdateUserBiometricInput } from './dto/update-biometric.user.dto';
import { AuthUser } from '../auth/custom-decorators/authenticated-user-decorator';

jest.mock('../utils/helper', () => ({
  hashPassword: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  const mockUser = (overrides = {}): User => ({
    id: 1,
    email: 'test@example.com',
    password: 'password',
    biometricKey: 'biometricKey',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('register', () => {
    it('should throw BadRequestException if user already exists', async () => {
      const input: CreateUseInput = { email: 'test@example.com', password: 'password' };
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser());

      await expect(userService.register(input)).rejects.toThrow(BadRequestException);
    });

    it('should create a new user if user does not exist', async () => {
      const input: CreateUseInput = { email: 'test@example.com', password: 'password' };
      const hashedPassword = 'hashedPassword';
      const createdUser = mockUser({ password: hashedPassword });

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(createdUser);

      const result = await userService.register(input);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findUsers', () => {
    it('should return an array of users', async () => {
      const users: User[] = [mockUser()];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      const result = await userService.findUsers();
      expect(result).toEqual(users);
    });
  });

  describe('findOneById', () => {
    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userService.findOneById(1)).rejects.toThrow(BadRequestException);
    });

    it('should return a user if user is found', async () => {
      const user: User = mockUser();
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await userService.findOneById(1);
      expect(result).toEqual(user);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if user is found', async () => {
      const user: User = mockUser();
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await userService.findOneByEmail('test@example.com');
      expect(result).toEqual(user);
    });
  });

  describe('updateBiometric', () => {
    it('should throw BadRequestException if user not found', async () => {
      const input: UpdateUserBiometricInput = { biometricKey: 'newBiometricKey' };
      const authUser: AuthUser = { id:1, email: 'test@example.com' };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      await expect(userService.updateBiometric({ input, authUser })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if biometricKey is already used by another user', async () => {
      const input: UpdateUserBiometricInput = { biometricKey: 'newBiometricKey' };
      const authUser: AuthUser = {  id:1, email: 'test@example.com' };
      const user: User = mockUser({ biometricKey: null });

      const otherUser: User = mockUser({ id: 2, email: 'other@example.com', biometricKey: await bcrypt.hash('newBiometricKey', 10) });
      const users: User[] = [otherUser];

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(userService.updateBiometric({ input, authUser })).rejects.toThrow(BadRequestException);
    });

    it('should update the biometric key if it is unique', async () => {
      const input: UpdateUserBiometricInput = { biometricKey: 'newBiometricKey' };
      const authUser: AuthUser = { id:1, email: 'test@example.com' };
      const user: User = mockUser({ biometricKey: null });

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([user]);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      const hashedBiometricKey = 'hashedBiometricKey';
      (hashPassword as jest.Mock).mockResolvedValue(hashedBiometricKey);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);

      const result = await userService.updateBiometric({ input, authUser });
      expect(result).toEqual(user);
    });
  });

  describe('findOneWithBiometricKey', () => {
    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(userService.findOneWithBiometricKey('biometricKey')).rejects.toThrow(BadRequestException);
    });

    it('should return a user if user is found', async () => {
      const user: User = mockUser();
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(user);

      const result = await userService.findOneWithBiometricKey('biometricKey');
      expect(result).toEqual(user);
    });
  });
});
