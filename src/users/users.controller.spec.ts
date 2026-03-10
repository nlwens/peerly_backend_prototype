import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateToken: jest.fn(),
    remove: jest.fn(),
    loginByName: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 'user-1', name: 'Alice' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('user-1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const body = {
        name: 'Alice',
        email: 'alice@test.com',
        password_hash: 'hash',
      };
      const created = { id: 'user-1', ...body };
      mockUsersService.create.mockResolvedValue(created);

      const result = await controller.create(body);

      expect(mockUsersService.create).toHaveBeenCalledWith(body);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const body = { description: 'New bio' };
      const updated = { id: 'user-1', name: 'Alice', ...body };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('user-1', body);

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', body);
      expect(result).toEqual(updated);
    });

    it('should throw HttpException NOT_FOUND on P2025 (record not found)', async () => {
      const error = { code: 'P2025' };
      mockUsersService.update.mockRejectedValue(error);

      try {
        await controller.update('user-1', { description: 'x' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((e as HttpException).message).toContain('User not found, update failed');
      }
    });

    it('should throw HttpException INTERNAL_SERVER_ERROR on other errors', async () => {
      mockUsersService.update.mockRejectedValue(new Error('DB error'));

      try {
        await controller.update('user-1', {});
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updateToken', () => {
    it('should call service.updateToken with id and token_balance', async () => {
      const updated = { id: 'user-1', token_balance: 50 };
      mockUsersService.updateToken.mockResolvedValue(updated);

      const result = await controller.updateToken('user-1', { token_balance: 50 });

      expect(mockUsersService.updateToken).toHaveBeenCalledWith('user-1', 50);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const deleted = { id: 'user-1' };
      mockUsersService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('user-1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(deleted);
    });
  });

  describe('loginByName', () => {
    it('should return user when found', async () => {
      const user = { id: 'user-1', name: 'Alice' };
      mockUsersService.loginByName.mockResolvedValue(user);

      const result = await controller.loginByName({ name: 'Alice' });

      expect(mockUsersService.loginByName).toHaveBeenCalledWith('Alice');
      expect(result).toEqual(user);
    });

    it('should throw HttpException NOT_FOUND when user not found', async () => {
      mockUsersService.loginByName.mockResolvedValue(null);

      try {
        await controller.loginByName({ name: 'Nobody' });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((e as HttpException).message).toContain('User not found');
      }
    });
  });
});
