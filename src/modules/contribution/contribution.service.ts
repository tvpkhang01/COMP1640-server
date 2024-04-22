import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contribution } from '../../entities/contribution.entity';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { Order, StatusEnum } from '../../common/enum/enum';
import { PageMetaDto } from '../../common/dtos/pageMeta';
import { ResponsePaginate } from '../../common/dtos/responsePaginate';
import { ContributionComment } from '../../entities/contributionComment.entity';
import { Multer } from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { FacultyService } from '../faculty/faculty.service';
import { Semester } from '../../entities/semester.entity';
import { Magazine } from '../../entities/magazine.entity';
import { SemesterService } from '../semester/semester.service';
import { MagazineService } from '../magazine/magazine.service';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UserService,
    private readonly facultyService: FacultyService,
    private readonly magazineService: MagazineService,
    private readonly semesterService: SemesterService,
    private readonly mailService: MailService,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
    @InjectRepository(Magazine)
    private readonly magazineRepository: Repository<Magazine>,
  ) {}

  async create(
    createContributionDto: CreateContributionDto,
    fileImages: Multer.File[],
    fileDocxs: Multer.File[],
  ) {
    const contribution = new Contribution(createContributionDto);

    const fileTitleUrl = await this.createAndUploadTitleFile(
      contribution.title,
    );
    contribution.fileTitle = [{ file: fileTitleUrl }];

    if (fileImages && fileImages.length > 0) {
      const imageUrls = await Promise.all(
        fileImages.map(async (file) => {
          const imageUrl = await this.uploadAndReturnImageUrl(file);
          return { file: imageUrl };
        }),
      );

      contribution.fileImage = imageUrls;
    }

    if (fileDocxs && fileDocxs.length > 0) {
      const docxUrls = await Promise.all(
        fileDocxs.map(async (file) => {
          const docxUrl = await this.uploadAndReturnDocxUrl(file);
          return { file: docxUrl };
        }),
      );

      contribution.fileDocx = docxUrls;
    }

    await this.entityManager.save(contribution);

    const student = await this.userService.getUserById(
      createContributionDto.studentId,
    );
    const faculty = await this.facultyService.getFacultyById(student.facultyId);
    const coordinator = await this.userService.getUserById(
      faculty.coordinatorId,
    );
    await this.mailService.sendPendingMail(
      contribution.id,
      coordinator.email,
      coordinator.userName,
    );

    return { contribution, message: 'Successfully create contribution' };
  }

  async uploadAndReturnImageUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }

  async uploadAndReturnDocxUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadDocxFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading docx to Cloudinary:', error);
      throw error;
    }
  }

  async getContributions(params: GetContributionParams) {
    const contributions = this.contributionsRepository
      .createQueryBuilder('contribution')
      .select(['contribution', 'student', 'magazine'])
      .leftJoin('contribution.student', 'student')
      .leftJoin('contribution.magazine', 'magazine')
      .andWhere('contribution.status = ANY(:status)', {
        status: params.status
          ? [params.status]
          : [StatusEnum.APPROVE, StatusEnum.PENDING, StatusEnum.REJECT],
      })
      .skip(params.skip)
      .take(params.take)
      .orderBy(
        'contribution.createdAt',
        params.order === Order.ASC ? Order.ASC : Order.DESC,
      );
    if (params.search) {
      contributions.andWhere(
        new Brackets((qb) => {
          qb.where('contribution.title ILIKE :search', {
            search: `%${params.search}%`,
          }).orWhere('student.userName ILIKE :search', {
            search: `%${params.search}%`,
          });
        }),
      );
    }
    if (params.facultyId) {
      contributions.andWhere('student.facultyId = :facultyId', {
        facultyId: params.facultyId,
      });
    }
    if (params.magazineId) {
      contributions.andWhere('magazine.id = :magazineId', {
        magazineId: params.magazineId,
      });
    }
    if (params.semesterId) {
      contributions.andWhere('magazine.semesterId = :semesterId', {
        semesterId: params.semesterId,
      });
    }
    if (params.userId) {
      contributions.andWhere('student.id = :studentId', {
        userId: params.userId,
      });
    }
    if (params.fileImage === 'notnull') {
      contributions.andWhere('contribution.fileImage IS NOT NULL');
    }
    if (params.fileDocx === 'notnull') {
      contributions.andWhere('contribution.fileDocx IS NOT NULL');
    }
    const [result, total] = await contributions.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getContributionsLatestMagazine(params: GetContributionParams) {
    const latestSemesters = await this.semesterRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const latestSemester = latestSemesters[0];

    if (!latestSemester) {
      throw new Error('No semesters available.');
    }

    const latestMagazines = await this.magazineRepository.find({
      where: { semesterId: latestSemester.id },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const latestMagazine = latestMagazines[0];

    if (!latestMagazine) {
      throw new Error('No magazines available for the latest semester.');
    }

    const contributions = this.contributionsRepository
      .createQueryBuilder('contribution')
      .select(['contribution', 'student', 'magazine'])
      .leftJoin('contribution.student', 'student')
      .leftJoin('contribution.magazine', 'magazine')
      .where('magazine.id = :magazineId', { magazineId: latestMagazine.id })
      .andWhere('contribution.status = ANY(:status)', {
        status: params.status
          ? [params.status]
          : [StatusEnum.APPROVE, StatusEnum.PENDING, StatusEnum.REJECT],
      })
      .skip(params.skip)
      .take(params.take)
      .orderBy(
        'contribution.createdAt',
        params.order === Order.ASC ? Order.ASC : Order.DESC,
      );
    if (params.facultyId) {
      contributions.andWhere('student.facultyId = :facultyId', {
        facultyId: params.facultyId,
      });
    }
    if (params.search) {
      contributions.andWhere(
        new Brackets((qb) => {
          qb.where('contribution.title ILIKE :search', {
            search: `%${params.search}%`,
          }).orWhere('student.userName ILIKE :search', {
            search: `%${params.search}%`,
          });
        }),
      );
    }
    if (params.userId) {
      contributions.andWhere('student.id = :studentId', {
        userId: params.userId,
      });
    }
    if (params.fileImage === 'notnull') {
      contributions.andWhere('contribution.fileImage IS NOT NULL');
    }
    if (params.fileDocx === 'notnull') {
      contributions.andWhere('contribution.fileDocx IS NOT NULL');
    }
    const [result, total] = await contributions.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: params,
    });
    return new ResponsePaginate(result, pageMetaDto, 'Success');
  }

  async getContributionById(id: string) {
    const contribution = await this.contributionsRepository
      .createQueryBuilder('contribution')
      .select(['contribution', 'student', 'magazine'])
      .leftJoin('contribution.student', 'student')
      .leftJoin('contribution.magazine', 'magazine')
      .where('contribution.id = :id', { id })
      .getOne();
    return contribution;
  }

  async update(
    id: string,
    updateContributionDto: UpdateContributionDto,
    fileImages: Multer.File[],
    fileDocxs: Multer.File[],
  ) {
    const contribution = await this.contributionsRepository.findOneBy({ id });
    try {
      if (!contribution) {
        return { message: 'Contribution not found' };
      }

      const magazine = await this.magazineService.getMagazineById(
        contribution.magazineId,
      );
      const closeDate = new Date(magazine.closeDate);

      const canAddNew = new Date() > closeDate;

      const semester = await this.semesterService.getSemesterById(
        magazine.semesterId,
      );
      const endDate = new Date(semester.endDate);
      const canUpdateSemester = new Date() < endDate;

      if (canUpdateSemester) {
        if (!canAddNew) {
          if (fileImages && fileImages.length > 0) {
            await this.deleteOldImageFiles(contribution);
            const imageUrls = await Promise.all(
              fileImages.map(async (file) => {
                const imageUrl = await this.uploadAndReturnImageUrl(file);
                return { file: imageUrl };
              }),
            );
            contribution.fileImage = imageUrls;
          }

          if (fileDocxs && fileDocxs.length > 0) {
            await this.deleteOldDocxFiles(contribution);
            const docxUrls = await Promise.all(
              fileDocxs.map(async (file) => {
                const docxUrl = await this.uploadAndReturnDocxUrl(file);
                return { file: docxUrl };
              }),
            );
            contribution.fileDocx = docxUrls;
          }
        } else {
          if (fileImages && fileImages.length > 0) {
            const imageUrls = await Promise.all(
              fileImages.map(async (file) => {
                const imageUrl = await this.uploadAndReturnImageUrl(file);
                return { file: imageUrl };
              }),
            );
            if (!contribution.fileImage) {
              contribution.fileImage = imageUrls;
            } else {
              contribution.fileImage = [
                ...contribution.fileImage,
                ...imageUrls,
              ];
            }
          }

          if (fileDocxs && fileDocxs.length > 0) {
            const docxUrls = await Promise.all(
              fileDocxs.map(async (file) => {
                const docxUrl = await this.uploadAndReturnDocxUrl(file);
                return { file: docxUrl };
              }),
            );
            if (!contribution.fileDocx) {
              contribution.fileDocx = docxUrls;
            } else {
              contribution.fileDocx = [...contribution.fileDocx, ...docxUrls];
            }
          }
        }
      } else {
        throw new HttpException(
          'Semester is closed',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
      if (
        updateContributionDto.title &&
        updateContributionDto.title !== contribution.title
      ) {
        const fileTitleUrl = await this.createAndUploadTitleFile(
          updateContributionDto.title,
        );
        const fileTitleObject = { file: fileTitleUrl };
        contribution.fileTitle = [fileTitleObject];
      }
      contribution.title = updateContributionDto.title;
      contribution.status = updateContributionDto.status;
      await this.entityManager.save(contribution);

      const student = await this.userService.getUserById(
        contribution.studentId,
      );
      switch (contribution.status) {
        case 'approve':
          await this.mailService.sendApproveMail(
            contribution.id,
            student.email,
            student.userName,
          );
          break;
        case 'reject':
          await this.mailService.sendRejectMail(
            contribution.id,
            student.email,
            student.userName,
          );
          break;
        case 'pending':
          const faculty = await this.facultyService.getFacultyById(
            student.facultyId,
          );
          const coordinator = await this.userService.getUserById(
            faculty.coordinatorId,
          );
          await this.mailService.sendPendingMail(
            contribution.id,
            coordinator.email,
            coordinator.userName,
          );
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const contribution = await this.contributionsRepository
      .createQueryBuilder('contribution')
      .leftJoinAndSelect(
        'contribution.contributionComment',
        'contributionComment',
      )
      .where('contribution.id = :id', { id })
      .getOne();
    if (!contribution) {
      return { message: 'Contribution not found' };
    }
    if (
      contribution.contributionComment &&
      contribution.contributionComment.length > 0
    ) {
      for (const contributionComment of contribution.contributionComment) {
        await this.entityManager.softDelete(ContributionComment, {
          id: contributionComment.id,
        });
      }
    }
    await this.contributionsRepository.softDelete(id);
    return { data: null, message: 'Contribution deletion successful' };
  }

  async deleteOldContributions() {
    const contributions = await this.contributionsRepository.find({
      where: {
        status: In([StatusEnum.PENDING, StatusEnum.REJECT]),
      },
    });

    // const currentDate = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14); // 14 ngày trước ngày hiện tại

    for (const contribution of contributions) {
      if (contribution.updatedAt <= cutoffDate) {
        await this.remove(contribution.id);
      }
    }
  }

  async deleteOldImageFiles(contribution: Contribution): Promise<void> {
    if (contribution.fileImage && contribution.fileImage.length > 0) {
      for (const fileImages of contribution.fileImage) {
        const publicId = this.cloudinaryService.extractPublicIdFromUrl(
          fileImages.file,
        );
        await this.cloudinaryService.deleteFile(publicId);
      }
    }
  }

  async deleteOldDocxFiles(contribution: Contribution): Promise<void> {
    if (contribution.fileDocx && contribution.fileDocx.length > 0) {
      for (const fileDocxs of contribution.fileDocx) {
        const publicId = this.cloudinaryService.extractPublicIdFromDocxUrl(
          fileDocxs.file,
        );
        await this.cloudinaryService.deleteDocxFile(publicId);
      }
    }
  }

  async createAndUploadTitleFile(title: string): Promise<string> {
    const extension = '.txt';

    if (extension === '.txt') {
      const fileName = 'Title_contribution.txt';
      const filePath = path.join(__dirname, '../../../', 'titles', fileName);
      fs.writeFileSync(filePath, title);

      try {
        const result = await this.cloudinaryService.uploadTitleFile(filePath);
        fs.unlinkSync(filePath);

        return result.secure_url;
      } catch (error) {
        console.error('Error uploading title file to Cloudinary:', error);
        throw error;
      }
    } else {
      throw new Error('File type not supported. Only accept txt files.');
    }
  }

  async downloadContributionFilesAsZip(
    contributionId: string,
  ): Promise<string> {
    const zip = await this.createZipForContribution([contributionId]);
    const zipFileName = `contribution_${contributionId}.zip`;
    return this.saveZipToFile(zip, zipFileName);
  }

  async downloadMultipleContributionsAsZip(
    contributionIds: string[],
  ): Promise<string> {
    const zip = await this.createZipForContribution(contributionIds);
    const zipFileName = `contributions_${contributionIds.join('_')}.zip`;
    return this.saveZipToFile(zip, zipFileName);
  }

  async downloadAllContributionsAsZip(): Promise<string> {
    const contributionsResponse = await this.getContributions({
      status: [StatusEnum.APPROVE, StatusEnum.PENDING, StatusEnum.REJECT],
      skip: 0,
      take: 9999,
      order: Order.ASC,
      searchByTitle: '',
      searchByUserName: '',
      title: '',
      filePaths: [],
    });
    if (
      !contributionsResponse.data ||
      contributionsResponse.data.length === 0
    ) {
      throw new Error('No contributions found');
    }
    const contributionIds = contributionsResponse.data.map(
      (contribution) => contribution.id,
    );
    const zip = await this.createZipForContribution(contributionIds);
    const zipFileName = `all_contributions.zip`;
    return this.saveZipToFile(zip, zipFileName);
  }

  private async createZipForContribution(
    contributionIds: string[],
  ): Promise<JSZip> {
    const zip = new JSZip();
    for (const id of contributionIds) {
      const contribution = await this.getContributionById(id);
      if (!contribution) {
        throw new Error(`Contribution with ID ${id} not found`);
      }
      const contributionFolder = zip.folder(`contribution_${id}`);
      const imageFolder = contributionFolder.folder('images');
      const docxFolder = contributionFolder.folder('docx');
      const titleFolder = contributionFolder.folder('title');
      for (const image of contribution.fileImage) {
        const imageUrl = image.file;
        const imageName = path.basename(imageUrl);
        const imageData = await this.downloadFile(imageUrl);
        imageFolder.file(imageName, imageData);
      }
      for (const docx of contribution.fileDocx) {
        const docxUrl = docx.file;
        const docxName = path.basename(docxUrl);
        const docxData = await this.downloadFile(docxUrl);
        docxFolder.file(docxName, docxData);
      }
      for (const title of contribution.fileTitle) {
        const titleUrl = title.file;
        const titleName = path.basename(titleUrl);
        const titleData = await this.downloadFile(titleUrl);
        titleFolder.file(titleName, titleData);
      }
    }
    return zip;
  }

  private async saveZipToFile(zip: JSZip, fileName: string): Promise<string> {
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const zipFilePath = path.join(
      __dirname,
      '../../../',
      'downloads',
      fileName,
    );
    fs.writeFileSync(zipFilePath, zipBuffer);
    return zipFilePath;
  }

  async downloadFile(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error downloading file');
    }
  }
}
