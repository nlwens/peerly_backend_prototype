import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  let requestsService: RequestsService;

  const mockRequestsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
    requestsService = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with userId', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'req-1', subject: 'Math' }];
      mockRequestsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(userId);

      expect(mockRequestsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const request = { id: 'req-1', subject: 'Math' };
      mockRequestsService.findOne.mockResolvedValue(request);

      const result = await controller.findOne('req-1');

      expect(mockRequestsService.findOne).toHaveBeenCalledWith('req-1');
      expect(result).toEqual(request);
    });
  });

  describe('create', () => {
    it('should call service.create with userId and body', async () => {
      const userId = 'user-1';
      const body = {
        receiver_id: 'user-2',
        subject: 'Physics',
        type: 'REQUEST' as const,
      };
      const created = { id: 'req-1', requester_id: userId, ...body };
      mockRequestsService.create.mockResolvedValue(created);

      const result = await controller.create(userId, body);

      expect(mockRequestsService.create).toHaveBeenCalledWith(userId, body);
      expect(result).toEqual(created);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus with id and status', async () => {
      const updated = { id: 'req-1', status: 'ACCEPTED' };
      mockRequestsService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus('req-1', { status: 'ACCEPTED' });

      expect(mockRequestsService.updateStatus).toHaveBeenCalledWith('req-1', 'ACCEPTED');
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      const deleted = { id: 'req-1' };
      mockRequestsService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('req-1');

      expect(mockRequestsService.remove).toHaveBeenCalledWith('req-1');
      expect(result).toEqual(deleted);
    });
  });
});
