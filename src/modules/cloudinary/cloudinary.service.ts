import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
  v2,
} from 'cloudinary';
import { Multer } from 'multer';
import bufferToStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: 'dnjkwuc7p',
      api_key: '958362746435231',
      api_secret: '8HhcfKbGE-xIayNWM2UahgBIsMA',
    });
  }

  async uploadFile(
    file: Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      bufferToStream(file.buffer).pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async getFileUrl(publicId: string) {
    try {
      const result = await cloudinary.url(publicId, { secure: true });
      return result;
    } catch (error) {
      console.error('Error getting file URL from Cloudinary:', error);
      throw error;
    }
  }

  extractPublicIdFromUrl(fileUrl: string): string {
    const parts = fileUrl.split('/');
    const lastPart = parts[parts.length - 1];
    const publicId = lastPart.split('.').slice(0, -1).join('.');
    return publicId;
  }
}

// async deleteOldImages(setting: Setting): Promise<void> {
//     const oldImages: string[] = [];
//     setting.bannerTop.forEach(banner => oldImages.push(banner.bannerTopImg));
//     setting.bannerBot.forEach(banner => oldImages.push(banner.bannerBotImg));
//     setting.slide.forEach(slide => oldImages.push(slide.slideImg));
//     await Promise.all(oldImages.map(async imageUrl => {
//       const publicId = this.cloudinaryService.extractPublicIdFromUrl(imageUrl);
//       await this.cloudinaryService.deleteImage(publicId);
//     }));
//   }

//   private async uploadAndReturnUrl(file: Multer.File): Promise<string> {
//     try {
//       const result = await this.cloudinaryService.uploadImage(file);
//       return result.secure_url;
//     } catch (error) {
//       console.error('Error uploading image to Cloudinary:', error);
//       throw error;
//     }
//   }
// async update(
//     updatedSetting: Partial<Setting>,
//     oldRatioPrice: number,
//     oldWarrantyFees: { [key: string]: number },
//     bannerTopImages: Multer.File[],
//     bannerBotImages: Multer.File[],
//     slideImages: Multer.File[]
//   ): Promise<Setting> {
//     const existingSetting = await this.settingRepository.findOne({ where: {} });
//     await this.deleteOldImages(existingSetting);
//     const mergedSetting = this.settingRepository.merge(existingSetting, updatedSetting);
//     const updatedSettingEntity = await this.settingRepository.save(mergedSetting);

//     if (JSON.stringify(updatedSettingEntity.warrantyFees) != JSON.stringify(oldWarrantyFees)) {
//       await this.ebayService.updateWarrantyFees(updatedSettingEntity.warrantyFees, oldWarrantyFees);
//     }

//     if (Number(updatedSettingEntity.ratioPrice) !== Number(oldRatioPrice)) {
//       await this.ebayService.updatePricesAccordingToRatio(updatedSettingEntity.ratioPrice, oldRatioPrice);
//     }

//     const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
//     const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
//     const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));

//     updatedSettingEntity.bannerTop = bannerTopUrls.map(url => ({ bannerTopImg: url }));
//     updatedSettingEntity.bannerBot = bannerBotUrls.map(url => ({ bannerBotImg: url }));
//     updatedSettingEntity.slide = slideUrls.map(url => ({ slideImg: url }));

//     const updatedSettingResult = await this.settingRepository.save(updatedSettingEntity);
//     return updatedSettingResult;
//   }
// async create(settingData: Partial<Setting>, bannerTopImages: Multer.File[], slideImages: Multer.File[], bannerBotImages: Multer.File[]): Promise<Setting> {
//     const bannerTopUrls = await Promise.all(bannerTopImages.map(async bannerTopImage => this.uploadAndReturnUrl(bannerTopImage)));
//     const bannerBotUrls = await Promise.all(bannerBotImages.map(async bannerBotImage => this.uploadAndReturnUrl(bannerBotImage)));
//     const slideUrls = await Promise.all(slideImages.map(async slideImage => this.uploadAndReturnUrl(slideImage)));

//     const setting: Partial<Setting> = {
//       ...settingData,
//       bannerTop: bannerTopUrls.map(url => ({ bannerTopImg: url })),
//       bannerBot: bannerBotUrls.map(url => ({ bannerBotImg: url })),
//       slide: slideUrls.map(url => ({ slideImg: url })),
//     };

//     return this.settingRepository.save(setting);
//   }
