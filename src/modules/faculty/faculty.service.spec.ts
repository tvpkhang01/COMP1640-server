import { Test, TestingModule } from '@nestjs/testing';
import { FacultyService } from './faculty.service';
import { Faculty } from '../../entities/faculty.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { GetFacultyParams } from './dto/getList_faculty.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { User } from '../../entities/user.entity';
import { GenderEnum, RoleEnum } from '../../common/enum/enum';
// import { Order } from 'src/common/enum/enum';

describe('FacultyService', () => {
  let service: FacultyService;
  let facultyRepository: Repository<Faculty>;
  let entityManager: EntityManager;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultyService,
        {
          provide: getRepositoryToken(Faculty),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
    entityManager = module.get<EntityManager>(EntityManager);
    facultyRepository = module.get<Repository<Faculty>>(
      getRepositoryToken(Faculty),
    );
    usersRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new faculty', async () => {
      const mockCreateFacultyDto: CreateFacultyDto = {
        coordinatorId: '123456',
        facultyName: 'IT',
      };
      const mockFaculty = new Faculty(mockCreateFacultyDto);
      const expectedResult = {
        faculty: mockFaculty,
        message: 'Successfully create faculty',
      };
  
      jest.spyOn(entityManager, 'save').mockResolvedValueOnce(mockFaculty);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      const result = await service.create(mockCreateFacultyDto);
  
      expect(entityManager.save).toHaveBeenCalledWith(expect.any(Faculty));
      expect(result).toEqual(expectedResult); 
    });
  });
  

  describe('getFaculties', () => {
    it('should return faculties with given parameters', async () => {
      const expectedFaculties: Faculty[] = [
        {
          id: '123',
          facultyName: 'IT',
          coordinatorId: '1',
          student: null,
          coordinator: null,
          createdAt: undefined,
          createdBy: '',
          updatedAt: undefined,
          updatedBy: '',
          deletedAt: undefined,
          deletedBy: '',
        }
      ]

      const mockQueryBuilder: Partial<SelectQueryBuilder<Faculty>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([expectedFaculties, expectedFaculties.length]),
      };

      const getManyAndCountSpy = jest
        .spyOn(facultyRepository, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      const params: GetFacultyParams = {
        skip: 0,
        take: 10,
        facultyName: 'IT',
      };
      const pageOptions: PageOptionsDto = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.take = 10;

      const result = await service.getFaculties(params);
      expect(getManyAndCountSpy).toHaveBeenCalledWith('faculty');
      expect(result.data).toEqual(expect.arrayContaining(expectedFaculties));
      expect(result.meta.itemCount).toBe(expectedFaculties.length);
      expect(result.message).toBe('Success');
    });
  });

  describe('getFacultyById', () => {
    it('should return faculty with given id', async () => {
      const id = '21341123';

      const expectedFaculty: Faculty = {
        id: '123',
        facultyName: 'IT',
        coordinatorId: '1',
        student: null,
        coordinator: null,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
      };

      const mockQueryBuilder: Partial<SelectQueryBuilder<Faculty>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedFaculty),
      };

      const getOneSpy = jest
        .spyOn(facultyRepository, 'createQueryBuilder')
        .mockReturnValueOnce(mockQueryBuilder as any);

      const result = await service.getFacultyById(id);

      expect(result).toEqual(expectedFaculty);
      expect(getOneSpy).toHaveBeenCalledWith('faculty');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('faculty.id = :id', {
        id,
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update faculty with valid input', async () => {
      const id = '123456';
      const updateFacultyDto: UpdateFacultyDto = {
        facultyName: 'New Faculty Name',
      };

      const findOneSpy = jest
        .spyOn(facultyRepository, 'findOneBy')
        .mockResolvedValueOnce({
          id: '123456',
          facultyName: 'Old Faculty Name',
        } as Faculty);

      const result = await service.update(id, updateFacultyDto);

      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(result.message).toEqual("Successfully update faculty");
    });
  });
  

  describe('remove', () => {
    it('should remove faculty successfully', async () => {
      // Mocking the facultiesRepository and entityManager methods
      const getOneMock = jest.fn().mockResolvedValueOnce({
        id: '123',
        student: [{ id: 'studentId1' }, { id: 'studentId2' }],
      });
      const softDeleteMock = jest.fn().mockResolvedValueOnce(undefined);
      const softDeleteStudentsMock = jest.fn().mockResolvedValueOnce(undefined);

      const facultiesRepositoryMock = {
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

      const usersRepositoryMock = {
        softDelete: softDeleteStudentsMock,
      }

      const service = new FacultyService(
        facultiesRepositoryMock as any,
        studentRepositoryMock as any,
        usersRepositoryMock as any
      );

      // Call the remove method with a valid ID
      const result = await service.remove('123');

      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();
      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(softDeleteStudentsMock).toHaveBeenCalledWith(User, {
        id: 'studentId1',
      });
      expect(softDeleteStudentsMock).toHaveBeenCalledWith(User, {
        id: 'studentId2',
      });
      expect(softDeleteStudentsMock).toHaveBeenCalledTimes(2);
      expect(softDeleteMock).toHaveBeenCalledWith('123');
      expect(softDeleteMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: null,
        message: 'Faculty deletion successful',
      });
    });

    it('should return error if faculty not found', async () => {
      // Mocking the facultiesRepository method to return undefined
      const getOneMock = jest.fn().mockResolvedValueOnce(undefined);

      const facultiesRepositoryMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: getOneMock,
          }),
        }),
      };

      const entityManagerMock = {};
      const usersRepositoryMock = {}
      const service = new FacultyService(
        facultiesRepositoryMock as any,
        entityManagerMock as any,
        usersRepositoryMock as any
      );

      // Call the remove method with an invalid ID
      const result = await service.remove('invalidId');

      // Assertions
      expect(getOneMock).toHaveBeenCalledWith();

      expect(getOneMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Faculty not found' });
    });
  });
});
