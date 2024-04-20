import { Test, TestingModule } from '@nestjs/testing';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { EntityManager, Repository } from 'typeorm';
import { Faculty } from '../../entities/faculty.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { GetFacultyParams } from './dto/getList_faculty.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

describe('FacultyController', () => {
  let controller: FacultyController;
  let service: FacultyService;
  let facultyRepository: Repository<Faculty>;
  let entityManager: EntityManager;
  let jwtService: JwtService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultyController],
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
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacultyController>(FacultyController);
    service = module.get<FacultyService>(FacultyService);
    entityManager = module.get<EntityManager>(EntityManager);
    facultyRepository = module.get<Repository<Faculty>>(
      getRepositoryToken(Faculty),)
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new faculty', async () => {
      const createFacultyDto: CreateFacultyDto = {
        facultyName: 'IT',
        coordinatorId: '123456',
      };
      const faculty: Faculty = {
        id: 'unique_id_here',
        facultyName: createFacultyDto.facultyName,
        coordinatorId: createFacultyDto.coordinatorId,
        student: [],
        coordinator: undefined,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: ''
      };
      const expectedResult = {
        faculty: faculty,
        message: 'Success',
      }
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createFacultyDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all faculties', async () => {
      const getFacultyParams: GetFacultyParams = {
        skip: 0,
        take: 10,
        facultyName: 'IT',
      };
  
      // Tạo đối tượng Faculty tương tự như expectedResult
      const faculty: Faculty = {
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
        deletedBy: ''
      };
  
      const expectedResult: ResponsePaginate<Faculty> = new ResponsePaginate(
        [faculty],
        new PageMetaDto({
          pageOptionsDto: {
            page: 1, take: 10,
            skip: 0
          }, itemCount: 1
        }),
        'Success'
      );
  
      jest.spyOn(service, 'getFaculties').mockResolvedValueOnce(expectedResult);
  
      const result = await controller.findAll(getFacultyParams);
  
      expect(result).toEqual(expectedResult);
    });
    
  });

  describe('findOne', () => {
    it('should return a faculty by id', async () => {
      const faculty: Faculty = {
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
        deletedBy: ''
      };
  
      jest.spyOn(service, 'getFacultyById').mockResolvedValueOnce(faculty);

      const result = await controller.findOne('1');

      expect(result).toEqual(faculty);
    });
  });
  
  describe('update', () => {
    it('should update a faculty', async () => {
      const updateFacultyDto: UpdateFacultyDto = {
        facultyName: 'New IT',
        coordinatorId: '789012',
      };
      const faculty: Faculty = {
        id: '123',
        facultyName: updateFacultyDto.facultyName,
        coordinatorId: updateFacultyDto.coordinatorId,
        student: null,
        coordinator: null,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: ''
      };
      const result = { 
        faculty: faculty,
        message: 'Successfully update faculty' 
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(result);
  
      const response = await controller.update('1', updateFacultyDto);
  
      expect(response).toEqual({ result, message: 'Successfully update faculty' });
    });
  });

  describe('remove', () => {
    it('should remove a faculty', async () => {
      const mockId = '1';
      const result = { data: undefined, message: 'Success' };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(result);
  
      const response = await controller.remove(mockId);
  
      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(response).toEqual({ data:result.data, message:result.message });
    });
  });

});
