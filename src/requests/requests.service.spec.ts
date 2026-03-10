import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: {
    requests: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
    study_sessions: {
      findUnique: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockRequester = { name: 'Alice', profile_image_url: '/alice.png' };
  const mockReceiver = { name: 'Bob', profile_image_url: '/bob.png' };

  beforeEach(async () => {
    const mockRequestsFindMany = jest.fn();
    const mockRequestsFindUnique = jest.fn();
    const mockRequestsCreate = jest.fn();
    const mockRequestsUpdate = jest.fn();
    const mockRequestsDelete = jest.fn();
    const mockRequestsDeleteMany = jest.fn();
    const mockStudySessionsFindUnique = jest.fn();
    const mockStudySessionsCreate = jest.fn();
    const mockStudySessionsDeleteMany = jest.fn();

    prisma = {
      requests: {
        findMany: mockRequestsFindMany,
        findUnique: mockRequestsFindUnique,
        create: mockRequestsCreate,
        update: mockRequestsUpdate,
        delete: mockRequestsDelete,
        deleteMany: mockRequestsDeleteMany,
      },
      study_sessions: {
        findUnique: mockStudySessionsFindUnique,
        create: mockStudySessionsCreate,
        deleteMany: mockStudySessionsDeleteMany,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return requests for user with other_user_name and other_user_avatar when user is requester', async () => {
      const userId = 'user-1';
      const mockRequests = [
        {
          id: 'req-1',
          requester_id: userId,
          receiver_id: 'user-2',
          subject: 'Math',
          type: 'REQUEST',
          status: 'PENDING',
          scheduled_datetime: null,
          created_at: new Date(),
          users_requests_requester_idTousers: mockRequester,
          users_requests_receiver_idTousers: mockReceiver,
        },
      ];
      prisma.requests.findMany.mockResolvedValue(mockRequests);

      const result = await service.findAll(userId);

      expect(prisma.requests.findMany).toHaveBeenCalledWith({
        where: { OR: [{ requester_id: userId }, { receiver_id: userId }] },
        include: {
          users_requests_requester_idTousers: { select: { name: true, profile_image_url: true } },
          users_requests_receiver_idTousers: { select: { name: true, profile_image_url: true } },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].other_user_name).toBe('Bob');
      expect(result[0].other_user_avatar).toBe('/bob.png');
    });

    it('should set other_user from requester when user is receiver', async () => {
      const userId = 'user-2';
      const mockRequests = [
        {
          id: 'req-1',
          requester_id: 'user-1',
          receiver_id: userId,
          subject: 'Math',
          type: 'REQUEST',
          status: 'PENDING',
          scheduled_datetime: null,
          created_at: new Date(),
          users_requests_requester_idTousers: mockRequester,
          users_requests_receiver_idTousers: mockReceiver,
        },
      ];
      prisma.requests.findMany.mockResolvedValue(mockRequests);

      const result = await service.findAll(userId);

      expect(result[0].other_user_name).toBe('Alice');
      expect(result[0].other_user_avatar).toBe('/alice.png');
    });

    it('should use fallbacks when other user data is null', async () => {
      prisma.requests.findMany.mockResolvedValue([
        {
          id: 'req-1',
          requester_id: 'user-1',
          receiver_id: 'user-2',
          subject: 'Math',
          type: 'REQUEST',
          status: 'PENDING',
          scheduled_datetime: null,
          created_at: new Date(),
          users_requests_requester_idTousers: null,
          users_requests_receiver_idTousers: null,
        },
      ]);

      const result = await service.findAll('user-1');

      expect(result[0].other_user_name).toBe('Unknown User');
      expect(result[0].other_user_avatar).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a request by id', async () => {
      const request = { id: 'req-1', subject: 'Math', type: 'REQUEST' };
      prisma.requests.findUnique.mockResolvedValue(request);

      const result = await service.findOne('req-1');

      expect(prisma.requests.findUnique).toHaveBeenCalledWith({ where: { id: 'req-1' } });
      expect(result).toEqual(request);
    });

    it('should return null when request not found', async () => {
      prisma.requests.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a request with PENDING status', async () => {
      const created = {
        id: 'req-1',
        requester_id: 'user-1',
        receiver_id: 'user-2',
        subject: 'Physics',
        type: 'REQUEST',
        status: 'PENDING',
        scheduled_datetime: null,
      };
      prisma.requests.create.mockResolvedValue(created);

      const result = await service.create('user-1', {
        receiver_id: 'user-2',
        subject: 'Physics',
        type: 'REQUEST',
      });

      expect(prisma.requests.create).toHaveBeenCalledWith({
        data: {
          requester_id: 'user-1',
          receiver_id: 'user-2',
          subject: 'Physics',
          type: 'REQUEST',
          scheduled_datetime: null,
          status: 'PENDING',
        },
      });
      expect(result).toEqual(created);
    });

    it('should pass scheduled_datetime when provided', async () => {
      const dateStr = '2025-03-10T14:00:00Z';
      prisma.requests.create.mockResolvedValue({});

      await service.create('user-1', {
        receiver_id: 'user-2',
        subject: 'Math',
        type: 'OFFER',
        scheduled_datetime: dateStr,
      });

      expect(prisma.requests.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          scheduled_datetime: new Date(dateStr),
        }),
      });
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException when request not found', async () => {
      prisma.requests.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('req-1', 'ACCEPTED')).rejects.toThrow(BadRequestException);
      await expect(service.updateStatus('req-1', 'ACCEPTED')).rejects.toThrow('Request not found');
    });

    it('should update status and return updated request', async () => {
      const existing = {
        id: 'req-1',
        status: 'PENDING',
        scheduled_datetime: new Date('2025-03-10T14:00:00Z'),
      };
      const updated = { ...existing, status: 'ACCEPTED' };
      prisma.requests.findUnique.mockResolvedValue(existing);
      prisma.requests.update.mockResolvedValue(updated);
      prisma.study_sessions.findUnique.mockResolvedValue(null);
      prisma.study_sessions.create.mockResolvedValue({});

      const result = await service.updateStatus('req-1', 'ACCEPTED');

      expect(prisma.requests.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'ACCEPTED' },
      });
      expect(result).toEqual(updated);
    });

    it('should create study session when status is ACCEPTED and has scheduled_datetime', async () => {
      const existing = {
        id: 'req-1',
        request_id: 'req-1',
        status: 'PENDING',
        scheduled_datetime: new Date('2025-03-10T14:00:00Z'),
      };
      prisma.requests.findUnique.mockResolvedValue(existing);
      prisma.requests.update.mockResolvedValue({ ...existing, status: 'ACCEPTED' });
      prisma.study_sessions.findUnique.mockResolvedValue(null);
      prisma.study_sessions.create.mockResolvedValue({});

      await service.updateStatus('req-1', 'ACCEPTED');

      expect(prisma.study_sessions.create).toHaveBeenCalledWith({
        data: {
          request_id: 'req-1',
          scheduled_datetime: existing.scheduled_datetime,
        },
      });
    });

    it('should not create study session if one already exists for request', async () => {
      const existing = {
        id: 'req-1',
        status: 'PENDING',
        scheduled_datetime: new Date('2025-03-10T14:00:00Z'),
      };
      prisma.requests.findUnique.mockResolvedValue(existing);
      prisma.requests.update.mockResolvedValue({});
      prisma.study_sessions.findUnique.mockResolvedValue({ id: 'session-1' });

      await service.updateStatus('req-1', 'ACCEPTED');

      expect(prisma.study_sessions.create).not.toHaveBeenCalled();
    });

    it('should delete study sessions when status is CANCELED', async () => {
      const existing = { id: 'req-1', status: 'PENDING', scheduled_datetime: null };
      prisma.requests.findUnique.mockResolvedValue(existing);
      prisma.requests.update.mockResolvedValue({ ...existing, status: 'CANCELED' });
      prisma.study_sessions.deleteMany.mockResolvedValue({ count: 1 });

      await service.updateStatus('req-1', 'CANCELED');

      expect(prisma.study_sessions.deleteMany).toHaveBeenCalledWith({ where: { request_id: 'req-1' } });
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException when request not found', async () => {
      prisma.requests.findUnique.mockResolvedValue(null);

      await expect(service.remove('req-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('req-1')).rejects.toThrow('Request not found');
    });

    it('should throw BadRequestException when request status is not deletable', async () => {
      prisma.requests.findUnique.mockResolvedValue({ id: 'req-1', status: 'ACCEPTED' });

      await expect(service.remove('req-1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('req-1')).rejects.toThrow(
        'Cannot delete a request with status ACCEPTED',
      );
      expect(prisma.requests.delete).not.toHaveBeenCalled();
    });

    it('should delete request when status is PENDING', async () => {
      const request = { id: 'req-1', status: 'PENDING' };
      prisma.requests.findUnique.mockResolvedValue(request);
      prisma.requests.delete.mockResolvedValue(request);

      const result = await service.remove('req-1');

      expect(prisma.requests.delete).toHaveBeenCalledWith({ where: { id: 'req-1' } });
      expect(result).toEqual(request);
    });

    it('should delete request when status is DECLINED or CANCELED', async () => {
      for (const status of ['DECLINED', 'CANCELED']) {
        prisma.requests.findUnique.mockResolvedValue({ id: 'req-1', status });
        prisma.requests.delete.mockResolvedValue({});

        await service.remove('req-1');

        expect(prisma.requests.delete).toHaveBeenCalledWith({ where: { id: 'req-1' } });
      }
    });
  });
});
