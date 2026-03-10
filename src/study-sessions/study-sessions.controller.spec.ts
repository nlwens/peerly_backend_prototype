import { Test, TestingModule } from '@nestjs/testing';
import { StudySessionsController } from './study-sessions.controller';
import { StudySessionsService } from './study-sessions.service';

describe('StudySessionsController', () => {
  let controller: StudySessionsController;
  let studySessionsService: StudySessionsService;

  const mockStudySessionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateDatetime: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudySessionsController],
      providers: [
        {
          provide: StudySessionsService,
          useValue: mockStudySessionsService,
        },
      ],
    }).compile();

    controller = module.get<StudySessionsController>(StudySessionsController);
    studySessionsService = module.get<StudySessionsService>(StudySessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with userId', async () => {
      const userId = 'user-1';
      const sessions = [{ id: 'session-1', request_id: 'req-1' }];
      mockStudySessionsService.findAll.mockResolvedValue(sessions);

      const result = await controller.findAll(userId);

      expect(mockStudySessionsService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(sessions);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const session = { id: 'session-1', request_id: 'req-1' };
      mockStudySessionsService.findOne.mockResolvedValue(session);

      const result = await controller.findOne('session-1');

      expect(mockStudySessionsService.findOne).toHaveBeenCalledWith('session-1');
      expect(result).toEqual(session);
    });
  });

  describe('create', () => {
    it('should call service.create with body', async () => {
      const body = { request_id: 'req-1', scheduled_datetime: '2025-03-10T14:00:00Z' };
      const created = { id: 'session-1', ...body };
      mockStudySessionsService.create.mockResolvedValue(created);

      const result = await controller.create(body);

      expect(mockStudySessionsService.create).toHaveBeenCalledWith(body);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should call service.updateDatetime with id and scheduled_datetime', async () => {
      const updated = {
        id: 'session-1',
        scheduled_datetime: new Date('2025-03-12T16:00:00Z'),
      };
      mockStudySessionsService.updateDatetime.mockResolvedValue(updated);

      const result = await controller.update('session-1', {
        scheduled_datetime: '2025-03-12T16:00:00Z',
      });

      expect(mockStudySessionsService.updateDatetime).toHaveBeenCalledWith(
        'session-1',
        '2025-03-12T16:00:00Z',
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      const deleted = { id: 'session-1' };
      mockStudySessionsService.remove.mockResolvedValue(deleted);

      const result = await controller.remove('session-1');

      expect(mockStudySessionsService.remove).toHaveBeenCalledWith('session-1');
      expect(result).toEqual(deleted);
    });
  });
});
