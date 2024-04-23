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
    module.get<Repository<Magazine>>(
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
      const expectedSemesters: Semester[] = [
        {
          id: '123',
          semesterName: 'Semester 1',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-06-30'),
          magazine: [],
          createdAt: undefined,
          createdBy: '',
          updatedAt: undefined,
          updatedBy: '',
          deletedAt: undefined,
          deletedBy: ''
        }
      ]

      const mockQueryBuilder: Partial<SelectQueryBuilder<Semester>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([expectedSemesters, expectedSemesters.length]),
      };

      const getManyAndCountSpy = jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

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
      expect(getManyAndCountSpy).toHaveBeenCalledWith('semester');
      expect(result.data).toEqual(expect.arrayContaining(expectedSemesters));
      expect(result.meta.itemCount).toBe(expectedSemesters.length);
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
    it('should remove semester successfully', async () => {
      // Mocking the semestersRepository and entityManager methods
      const getOneMock = jest.fn().mockResolvedValueOnce({
        id: '123',
        student: [{ id: 'studentId1' }, { id: 'studentId2' }],
      });
      const softDeleteMock = jest.fn().mockResolvedValueOnce(undefined);
      const softDeleteStudentsMock = jest.fn().mockResolvedValueOnce(undefined);

      const semestersRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: getOneMock,
          }),
        }),
        softDelete: softDeleteMock,
      };
      const studentRepositoryMock = {
        softDelete: softDeleteStudentsMock,
      };


      const service = new SemesterService(
        semestersRepositoryMock as any,
        studentRepositoryMock as any,
      );

      // Call the remove method with a valid ID
      const result = await service.remove('123');

      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();
      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(softDeleteMock).toHaveBeenCalledWith('123');
      expect(softDeleteMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: null,
        message: 'Semester deletion successful',
      });
    });

    it('should return error if semester not found', async () => {
      // Mocking the semestersRepository method to return undefined
      const getOneMock = jest.fn().mockResolvedValueOnce(undefined);

      const semestersRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: getOneMock,
          }),
        }),
      };

      const entityManagerMock = {};
      const service = new SemesterService(
        semestersRepositoryMock as any,
        entityManagerMock as any,
      );

      // Call the remove method with an invalid ID
      const result = await service.remove('invalidId');

      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();

      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Semester not found' });
    });
  });
});
