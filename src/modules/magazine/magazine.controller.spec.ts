import { Test, TestingModule } from '@nestjs/testing';
import { MagazineController } from './magazine.controller';
import { MagazineService } from './magazine.service';
import { EntityManager, Repository } from 'typeorm';
import { Magazine } from '../../entities/magazine.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { GetMagazineParams } from './dto/getList-magazine.dto';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { UpdateMagazineDto } from './dto/update-magazine.dto';

describe('MagazineController', () => {
  let controller: MagazineController;
  let service: MagazineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagazineController],
      providers: [
        MagazineService,
        {
          provide: getRepositoryToken(Magazine),
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

    controller = module.get<MagazineController>(MagazineController);
    service = module.get<MagazineService>(MagazineService);
    entityManager = module.get<EntityManager>(EntityManager);
    magazineRepository = module.get<Repository<Magazine>>(
      getRepositoryToken(Magazine),
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new magazine', async () => {
      const createMagazineDto: CreateMagazineDto = {
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
      };
      const magazine: Magazine = {
        id: '123456',
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        semester: undefined,
        contribution: [],
      };
      const expectedResult = {
        magazine: magazine,
        message: 'Success',
      };
      jest.spyOn(service, 'create').mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createMagazineDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all magazines', async () => {
      const getMagazineParams: GetMagazineParams = {
        skip: 0,
        take: 10,
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
        finalCloseDate: new Date('2022-07-30'),
      };

      // Tạo đối tượng Magazine tương tự như expectedResult
      const magazine: Magazine = {
        id: '123',
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        semester: undefined,
        contribution: [],
      };

      const expectedResult: ResponsePaginate<Magazine> = new ResponsePaginate(
        [magazine],
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

      jest.spyOn(service, 'getMagazines').mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(getMagazineParams);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a magazine by id', async () => {
      const magazine: Magazine = {
        id: '123',
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        semester: undefined,
        contribution: [],
      };

      jest.spyOn(service, 'getMagazineById').mockResolvedValueOnce(magazine);

      const result = await controller.findOne('123');

      expect(result).toEqual(magazine);
    });
  });

  describe('update', () => {
    it('should update a magazine', async () => {
      const updateMagazineDto: UpdateMagazineDto = {
        magazineName: 'New Magazine',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '789012',
      };
      const magazine: Magazine = {
        id: '123',
        magazineName: updateMagazineDto.magazineName,
        openDate: updateMagazineDto.openDate,
        closeDate: updateMagazineDto.closeDate,
        semesterId: updateMagazineDto.semesterId,
        createdAt: undefined,
        createdBy: '',
        updatedAt: undefined,
        updatedBy: '',
        deletedAt: undefined,
        deletedBy: '',
        semester: undefined,
        contribution: [],
      };
      const result = {
        magazine: magazine,
        message: 'Successfully update magazine',
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(result);

      const response = await controller.update('1', updateMagazineDto);

      expect(response).toEqual({
        result,
        message: 'Successfully update magazine',
      });
    });
  });

  describe('remove', () => {
    it('should remove a magazine', async () => {
      const mockId = '1';
      const result = { data: undefined, message: 'Success' };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(result);

      const response = await controller.remove(mockId);

      expect(service.remove).toHaveBeenCalledWith(mockId);
      expect(response).toEqual({ data: result.data, message: result.message });
    });
  });
});
