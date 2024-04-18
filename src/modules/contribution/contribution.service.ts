import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contribution } from 'src/entities/contribution.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { Order, StatusEnum, TermEnum } from 'src/common/enum/enum';
import { PageMetaDto } from 'src/common/dtos/pageMeta';
import { ResponsePaginate } from 'src/common/dtos/responsePaginate';
import { ContributionComment } from 'src/entities/contributionComment.entity';
import { Multer } from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionsRepository: Repository<Contribution>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(
    createContributionDto: CreateContributionDto,
    fileImages: Multer.File[],
    fileDocxs: Multer.File[],
  ) {
    const contribution = new Contribution(createContributionDto);

    const fileTitleUrl = await this.createAndUploadTitleFile(contribution.title);
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
    return { contribution, message: 'Successfully create contribution' };
  }

  private async uploadAndReturnImageUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }

  private async uploadAndReturnDocxUrl(file: Multer.File): Promise<string> {
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
    if (params.searchByTitle) {
      contributions.andWhere('contribution.title ILIKE :title', {
        title: `%${params.searchByTitle}%`,
      });
    }
    if (params.searchByUserName) {
      contributions.andWhere('student.userName ILIKE :userName', {
        userName: `%${params.searchByUserName}%`,
      });
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
      .select(['contribution', 'student'])
      .leftJoin('contribution.student', 'student')
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

      if (updateContributionDto.title && updateContributionDto.title !== contribution.title) {
        const fileTitleUrl = await this.createAndUploadTitleFile(updateContributionDto.title);
        const fileTitleObject = { file: fileTitleUrl };
        contribution.fileTitle = [fileTitleObject];
      }
    
      contribution.title = updateContributionDto.title;
      contribution.status = updateContributionDto.status;
      await this.entityManager.save(contribution);
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
    if (contribution.contributionComment.length > 0) {
      for (const contributionComment of contribution.contributionComment) {
        await this.entityManager.softDelete(ContributionComment, {
          id: contributionComment.id,
        });
      }
    }
    await this.contributionsRepository.softDelete(id);
    return { data: null, message: 'Contribution deletion successful' };
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

  private async createAndUploadTitleFile(title: string): Promise<string> {
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

  async downloadContributionFilesAsZip(contributionId: string): Promise<string> {
    const zip = await this.createZipForContribution([contributionId]);
    const zipFileName = `contribution_${contributionId}.zip`;
    return this.saveZipToFile(zip, zipFileName);
  }

  async downloadMultipleContributionsAsZip(contributionIds: string[]): Promise<string> {
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
      term: TermEnum.AGREE,
    });
    if (!contributionsResponse.data || contributionsResponse.data.length === 0) {
      throw new Error('No contributions found');
    }
    const contributionIds = contributionsResponse.data.map(contribution => contribution.id);
    const zip = await this.createZipForContribution(contributionIds);
    const zipFileName = `all_contributions.zip`;
    return this.saveZipToFile(zip, zipFileName);
  }

  private async createZipForContribution(contributionIds: string[]): Promise<JSZip> {
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
    const zipFilePath = path.join(__dirname, '../../../', 'downloads', fileName);
    fs.writeFileSync(zipFilePath, zipBuffer);
    return zipFilePath;
  }

  async downloadFile(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Error downloading file');
    }
  }
}
