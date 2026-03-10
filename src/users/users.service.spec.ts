import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    users: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      users: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', name: 'Alice', email: 'alice@test.com' },
        { id: '2', name: 'Bob', email: 'bob@test.com' },
      ];
      prisma.users.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(prisma.users.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 'user-1', name: 'Alice', email: 'alice@test.com' };
      prisma.users.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user when email is not taken', async () => {
      const createData = {
        name: 'Alice',
        email: 'alice@test.com',
        password_hash: 'hash',
      };
      const created = { id: 'user-1', ...createData };
      prisma.users.findUnique.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue(created);

      const result = await service.create(createData);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { email: createData.email } });
      expect(prisma.users.create).toHaveBeenCalledWith({ data: createData });
      expect(result).toEqual(created);
    });

    it('should throw HttpException when email already registered', async () => {
      const createData = { name: 'Alice', email: 'alice@test.com', password_hash: 'hash' };
      prisma.users.findUnique.mockResolvedValue({ id: 'existing', email: createData.email });

      await expect(service.create(createData)).rejects.toThrow(HttpException);
      await expect(service.create(createData)).rejects.toThrow('Email already registered');
      expect(prisma.users.create).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST status when email already registered', async () => {
      const createData = { name: 'Alice', email: 'alice@test.com', password_hash: 'hash' };
      prisma.users.findUnique.mockResolvedValue({ id: 'existing', email: createData.email });

      try {
        await service.create(createData);
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { description: 'Updated bio' };
      const updated = { id: 'user-1', name: 'Alice', ...updateData };
      prisma.users.update.mockResolvedValue(updated);

      const result = await service.update('user-1', updateData);

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('updateToken', () => {
    it('should update user token balance', async () => {
      const updated = { id: 'user-1', token_balance: 100 };
      prisma.users.update.mockResolvedValue(updated);

      const result = await service.updateToken('user-1', 100);

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { token_balance: 100 },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const deleted = { id: 'user-1', name: 'Alice' };
      prisma.users.delete.mockResolvedValue(deleted);

      const result = await service.remove('user-1');

      expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(deleted);
    });
  });

  describe('loginByName', () => {
    it('should return user when found by name', async () => {
      const user = { id: 'user-1', name: 'Alice', email: 'alice@test.com' };
      prisma.users.findFirst.mockResolvedValue(user);

      const result = await service.loginByName('Alice');

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { name: 'Alice' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when no user with name', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      const result = await service.loginByName('Nobody');

      expect(result).toBeNull();
    });
  });
});
