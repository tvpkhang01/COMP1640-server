import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
  v2,
} from 'cloudinary';
import { Multer } from 'multer';
import bufferToStream = require('buffer-to-stream');
import path = require('path');

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: 'dnjkwuc7p',
      api_key: '958362746435231',
      api_secret: '8HhcfKbGE-xIayNWM2UahgBIsMA',
    });
  }

  async uploadImageFile(
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

  async uploadDocxFile(
    file: Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto', format: 'docx' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      if (
        file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        bufferToStream(file.buffer).pipe(upload);
      } else {
        reject(new Error('File type not supported. Only accept docx files.'));
      }
    });
  }

  async uploadTitleFile(filePath: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
        const result = await v2.uploader.upload(filePath, { resource_type: 'auto', format: 'txt' });
        return result;
    } catch (error) {
        console.error('Error uploading title file to Cloudinary:', error);
        throw error;
    }
}


  async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async deleteDocxFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.delete_resources([publicId], {
        type: 'upload',
        resource_type: 'raw',
      });
      return result;
    } catch (error) {
      throw error;
    }
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

  extractPublicIdFromDocxUrl(fileUrl: string): string {
    const parts = fileUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart;
  }
}
