import { Test, TestingModule } from '@nestjs/testing';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { Semester } from '../../entities/semester.entity';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { GetSemesterParams } from './dto/getList_semester.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { UpdateSemesterDto } from './dto/update-semester.dto';

describe('SemesterController', () => {
  let controller: SemesterController;
  let service: SemesterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemesterController],
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
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SemesterController>(SemesterController);
    service = module.get<SemesterService>(SemesterService);
    module.get<EntityManager>(EntityManager);
    module.get<Repository<Semester>>(getRepositoryToken(Semester));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new semester', async () => {
      const createSemesterDto: CreateSemesterDto = {
        semesterName: 'Semester 1',
        startDate: new Date(),
        endDate: new Date(),
      };
      const semester: Semester = {
        id: 'unique_id_here',
        semesterName: createSemesterDto.semesterName,
        startDate: createSemesterDto.startDate,
        endDate: createSemesterDto.endDate,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        magazine: [],
      };
      const expectedResult = {
        semester: semester,
        message: 'Success',
      };
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createSemesterDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all semesters', async () => {
      const getSemesterParams: GetSemesterParams = {
        skip: 0,
        take: 10,
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
      };

      // Tạo đối tượng Semester tương tự như expectedResult
      const semester: Semester = {
        id: '123',
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        magazine: [],
      };

      const expectedResult: ResponsePaginate<Semester> = new ResponsePaginate(
        [semester],
        new PageMetaDto({
          pageOptionsDto: {
            page: 1,
            take: 10,
            skip: 0,
          },
          itemCount: 1,
        }),
        'Success',
      );

      jest.spyOn(service, 'getSemesters').mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(getSemesterParams);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a semester by id', async () => {
      const semester: Semester = {
        id: '123',
        semesterName: 'Semester 1',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        magazine: [],
      };

      jest.spyOn(service, 'getSemesterById').mockResolvedValueOnce(semester);

      const result = await controller.findOne('1');

      expect(result).toEqual(semester);
    });
  });

  describe('update', () => {
    it('should update a semester', async () => {
      const updateSemesterDto: UpdateSemesterDto = {
        semesterName: 'New Semester',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-06-30'),
      };
      const semester: Semester = {
        id: '123',
        semesterName: updateSemesterDto.semesterName,
        startDate: updateSemesterDto.startDate,
        endDate: updateSemesterDto.endDate,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        magazine: [],
      };
      const result = {
        semester: semester,
        message: 'Successfully update semester',
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(result);

      const response = await controller.update('1', updateSemesterDto);

      expect(response.result).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a semester', async () => {
      const mockId = '1';
      const result = { data: undefined, message: 'Success' };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(result);

      const response = await controller.remove(mockId);

      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(response).toEqual({ data: result.data, message: result.message });
    });
  });
});
