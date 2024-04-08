import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { GetContributionParams } from './dto/getList_contribition.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { Response } from 'express';

@Controller('contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fileImage', maxCount: 5 },
      { name: 'fileDocx', maxCount: 5 },
    ]),
  )
  async create(
    @Body() createContributionDto: CreateContributionDto,
    @UploadedFiles()
    files: { fileImage?: Multer.File[]; fileDocx?: Multer.File[] },
  ) {
    const fileImages = files.fileImage;
    const fileDocxs = files.fileDocx;
    return this.contributionService.create(
      createContributionDto,
      fileImages,
      fileDocxs,
    );
  }

  @Get('download-all')
  async downloadAllContributionsAsZip(@Res() res: Response) {
    try {
      const zipFilePath = await this.contributionService.downloadAllContributionsAsZip();
      res.download(zipFilePath);
      console.log('đasadsa',zipFilePath)
    } catch (error) {
      res.status(500).send({ message: 'Failed to download all contributions' });
    }
  }

  @Get()
  async findAll(@Query() params: GetContributionParams) {
    return this.contributionService.getContributions(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contributionService.getContributionById(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fileImage', maxCount: 5 },
      { name: 'fileDocx', maxCount: 5 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatecontributionDto: UpdateContributionDto,
    @UploadedFiles()
    files: { fileImage?: Multer.File[]; fileDocx?: Multer.File[] },
  ) {
    const fileImages = files.fileImage;
    const fileDocxs = files.fileDocx;
    const result = await this.contributionService.update(
      id,
      updatecontributionDto,
      fileImages,
      fileDocxs,
    );
    return { result, message: 'Successfully update contribituon' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.contributionService.remove(id);
    if (result.message) {
      return { message: result.message };
    } else {
      return { data: result.data, message: 'Success' };
    }
  }
  
  @Get('download/:id')
  async downloadContributionFilesAsZip(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const zipFilePath = await this.contributionService.downloadContributionFilesAsZip(id);
      res.download(zipFilePath);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  @Get('download/multiple/:ids')
  async downloadMultipleContributionsAsZip(
    @Param('ids') ids: string,
    @Res() res: Response,
  ) {
    try {
      const zipFileName = await this.contributionService.downloadMultipleContributionsAsZip(ids.split(','));
      res.download(zipFileName);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

}
