import { Test, TestingModule } from '@nestjs/testing';
import { MagazineService } from './magazine.service';
import { EntityManager, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { Magazine } from '../../entities/magazine.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { GetMagazineParams } from './dto/getList-magazine.dto';
import { PageOptionsDto } from '../../common/dtos/pageOption';
import { UpdateMagazineDto } from './dto/update-magazine.dto';

describe('MagazineService', () => {
  let service: MagazineService;
  let repository: Repository<Magazine>;
  let entityManager: EntityManager;
  
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<MagazineService>(MagazineService);
    entityManager = module.get<EntityManager>(EntityManager);
    repository = module.get<Repository<Magazine>>(
    getRepositoryToken(Magazine),)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new magazine', async () => {
      const createMagazineDto: CreateMagazineDto = {
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456'
      };
      const expectedResult = {
        magazine: new Magazine(createMagazineDto),
        message: 'Successfully create magazine',
      };
      jest.spyOn(entityManager, 'save').mockResolvedValueOnce(expectedResult);
  
      const result = await service.create(createMagazineDto);
  
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getMagazines', () => {
    it('should return magazines with given parameters', async () => {
      const params: GetMagazineParams = {
        skip: 0,
        take: 10,
        magazineName: "Magazine 1",
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        finalCloseDate: new Date('2022-07-30'),
        semesterId: '123456'
      };
      const pageOptions: PageOptionsDto = new PageOptionsDto();
      pageOptions.page = 1;
      pageOptions.take = 10;

      const skipValue: number = pageOptions.skip;

      const mockQueryBuilder: Partial<SelectQueryBuilder<Magazine>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValueOnce([[], 0]),
      };

      const getManyAndCountSpy = jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);
      const result = await service.getMagazines(params);
      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toEqual(0);
      expect(result.message).toBe('Success');
    });
  });

  describe('getMagazineById', () => {
    it('should return magazine with given id', async () => {
      const id = '21341123';
  
      const expectedMagazine: Magazine = {
        id,
        magazineName: 'Magazine 1',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '123456',
        createdAt: undefined,
        createdBy: "",
        updatedAt: undefined,
        updatedBy: "",
        deletedAt: undefined,
        deletedBy: "",
        semester: undefined,
        contribution: []
      };
  
      const mockQueryBuilder: Partial<SelectQueryBuilder<Magazine>> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(expectedMagazine),
      };
  
      const getOneSpy = jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce(mockQueryBuilder as any);
  
      const result = await service.getMagazineById(id);
  
      expect(result).toEqual(expectedMagazine);
      expect(getOneSpy).toHaveBeenCalledWith('magazine');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('magazine.id = :id', { id });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update magazine with valid input', async () => {
      const id = '123456';
      const updateMagazineDto: UpdateMagazineDto = {
        magazineName: 'New Magazine Name',
        openDate: new Date('2022-01-01'),
        closeDate: new Date('2022-06-30'),
        semesterId: '7890',
      };

      const findOneSpy = jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(
        {
          id: '123456',
          magazineName: 'Old Magazine Name',
          openDate: new Date('2022-01-01'),
          closeDate: new Date('2022-06-30'),
          semesterId: '7890',
        } as Magazine
      );
  
      const result = await service.update(id, updateMagazineDto);
  
      expect(findOneSpy).toHaveBeenCalledWith({ id });
      expect(result).toEqual({
        magazine: {
          id: '123456',
          magazineName: 'New Magazine Name',
          openDate: new Date('2022-01-01'),
          closeDate: new Date('2022-06-30'),
          semesterId: '7890',
        },
        message: 'Successfully update magazine',
      });
    });
  });

  // describe('remove', () => {
  //   it('should remove an existing magazine', async () => {
  //     // Arrange
  //     const id = '123456'; 
  //     const findOneByMock = jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
  //       leftJoinAndSelect: jest.fn().mockReturnThis(),
  //       where: jest.fn().mockReturnThis(),
  //       getOne: jest.fn().mockResolvedValueOnce({
  //         id: '123456',
  //         magazineName: 'Old Magazine Name',
  //         openDate: new Date('2022-01-01'),
  //         closeDate: new Date('2022-06-30'),
  //         semesterId: '7890',
  //         contribution: [{ id: 'contribId1' }, { id: 'contribId2' }] // Mocking contributions
  //       }),
  //     } as any);
      
  //     const softDeleteSpy = jest.spyOn(repository, 'softDelete').mockResolvedValueOnce(expect.any(Object) as UpdateResult);
  //     const softDeleteContributionSpy = jest.spyOn(entityManager, 'softDelete').mockResolvedValueOnce(expect.any(Object) as Promise<UpdateResult>);
      
  //     // Act
  //     await service.remove(id);
    
  //     // Assert
  //     expect(findOneByMock).toHaveBeenCalledWith('magazine');
  //     expect(softDeleteSpy).toHaveBeenCalledWith(id);
  //     expect(softDeleteContributionSpy).toHaveBeenCalledWith(entityManager, { id: 'contribId1' });
  //     expect(softDeleteContributionSpy).toHaveBeenCalledWith(entityManager, { id: 'contribId2' });
  //   });
  // });
  
  
})