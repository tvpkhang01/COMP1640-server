import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { SemesterService } from './semester.service';
import { Semester } from '../../entities/semester.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { GetSemesterParams } from './dto/getList_semester.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Magazine } from '../../entities/magazine.entity';

describe('SemesterService', () => {
  let service: SemesterService;
  let repository: Repository<Semester>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterService,
        {
          provide: getRepositoryToken(Semester),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: {
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Magazine),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SemesterService>(SemesterService);
    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<Repository<Semester>>(getRepositoryToken(Semester));
    magazineRepository = module.get<Repository<Magazine>>(
      getRepositoryToken(Magazine),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new semester', async () => {
      const createSemesterDto: CreateSemesterDto = {
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
      };
      const expectedResult = {
        semester: new Semester(createSemesterDto),
        message: 'Successfully create semester',
      };
      jest.spyOn(entityManager, 'save').mockResolvedValueOnce(expectedResult);

      const result = await service.create(createSemesterDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSemesters', () => {
    it('should return semesters with given parameters', async () => {
      const params: GetSemesterParams = {
        skip: 0,
        take: 10,
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
      };
      const pageOptions: PageOptionsDto = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.take = 10;

      const result = await service.getSemesters(params);
      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toEqual(0);
      expect(result.message).toBe('Success');
    });
  });

  describe('getSemesterById', () => {
    it('should return semester with given id', async () => {
      const id = '21341123';

      const expectedSemester: Semester = {
        id,
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
        magazine: [],
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
      };

      const mockQueryBuilder: Partial<SelectQueryBuilder<Semester>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedSemester),
      };

      const getOneSpy = jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      const result = await service.getSemesterById(id);

      expect(result).toEqual(expectedSemester);
      expect(getOneSpy).toHaveBeenCalledWith('semester');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('semester.id = :id', {
        id,
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update semester with valid input', async () => {
      const id = '123456';
      const updateSemesterDto: UpdateSemesterDto = {
        semesterName: 'New Semester Name',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
      };

      const findOneSpy = jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce({
          id: '123456',
          semesterName: 'Old Semester Name',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-06-30'),
        } as Semester);

      const result = await service.update(id, updateSemesterDto);

      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(result).toEqual({
        semester: {
          id: '123456',
          semesterName: 'New Semester Name',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-06-30'),
        },
        message: 'Successfully update semester',
      });
    });
  });

  describe('remove', () => {
    it('should remove semester and associated magazines', async () => {
      const semesterId = '123';
      const magazines = [new Magazine({}), new Magazine({})];

      const semester = {
        id: semesterId,
        magazine: magazines,
      } as unknown as Semester;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(semester),
      } as any);

      const softDeleteSpy = jest
        .spyOn(repository, 'softDelete')
        .mockResolvedValue(undefined);
      const softDeleteMagazineSpy = jest
        .spyOn(entityManager, 'softDelete')
        .mockResolvedValue(undefined);

      const result = await service.remove(semesterId);

      expect(result).toEqual({
        data: null,
        message: 'Semester deletion successful',
      });
      expect(softDeleteSpy).toHaveBeenCalledWith(semesterId);
      expect(softDeleteMagazineSpy).toHaveBeenCalledTimes(2);
    });

    it('should return message if semester not found', async () => {
      const semesterId = '123';
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await service.remove(semesterId);

      expect(result).toEqual({ message: 'Semmester not found' });
    });
  });
});
