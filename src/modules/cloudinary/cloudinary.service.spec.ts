import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { Multer } from 'multer';
import { UploadApiResponse } from 'cloudinary';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should upload image file', async () => {
    const file: Multer.File = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1000,
      buffer: Buffer.from('test-image-buffer'),
    };

    const uploadResponse: UploadApiResponse = {
      public_id: 'test_image_public_id',
      url: 'test_image_url',
      version: 0,
      signature: '',
      width: 0,
      height: 0,
      format: '',
      resource_type: 'image',
      created_at: '',
      tags: [],
      pages: 0,
      bytes: 0,
      type: '',
      etag: '',
      placeholder: false,
      secure_url: '',
      access_mode: '',
      original_filename: '',
      moderation: [],
      access_control: [],
      context: undefined,
      metadata: undefined,
    };

    jest.spyOn(service, 'uploadImageFile').mockResolvedValue(uploadResponse);

    const result = await service.uploadImageFile(file);

    expect(result).toEqual(uploadResponse);
  });

  it('should upload docx file', async () => {
    const file: Multer.File = {
      fieldname: 'docx',
      originalname: 'test.docx',
      encoding: '7bit',
      mimetype:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1000,
      buffer: Buffer.from('test-docx-buffer'),
    };

    const uploadResponse: UploadApiResponse = {
      public_id: 'test_title_public_id',
      url: 'test_title_url',
      version: 0,
      signature: '',
      width: 0,
      height: 0,
      format: '',
      resource_type: 'image',
      created_at: '',
      tags: [],
      pages: 0,
      bytes: 0,
      type: '',
      etag: '',
      placeholder: false,
      secure_url: '',
      access_mode: '',
      original_filename: '',
      moderation: [],
      access_control: [],
      context: undefined,
      metadata: undefined,
    };

    jest.spyOn(service, 'uploadDocxFile').mockResolvedValue(uploadResponse);

    const result = await service.uploadDocxFile(file);

    expect(result).toEqual(uploadResponse);
  });

  it('should upload title file', async () => {
    const filePath = '/path/to/title/file.txt';

    const uploadResponse: UploadApiResponse = {
      public_id: 'test_title_public_id',
      url: 'test_title_url',
      version: 0,
      signature: '',
      width: 0,
      height: 0,
      format: '',
      resource_type: 'image',
      created_at: '',
      tags: [],
      pages: 0,
      bytes: 0,
      type: '',
      etag: '',
      placeholder: false,
      secure_url: '',
      access_mode: '',
      original_filename: '',
      moderation: [],
      access_control: [],
      context: undefined,
      metadata: undefined,
    };

    jest.spyOn(service, 'uploadTitleFile').mockResolvedValue(uploadResponse);

    const result = await service.uploadTitleFile(filePath);

    expect(result).toEqual(uploadResponse);
  });

  it('should delete file', async () => {
    const publicId = 'test_public_id';

    const deleteResponse = { result: 'ok' };

    jest.spyOn(service, 'deleteFile').mockResolvedValue(deleteResponse);

    const result = await service.deleteFile(publicId);

    expect(result).toEqual(deleteResponse);
  });

  it('should delete docx file', async () => {
    const publicId = 'test_docx_public_id';

    const deleteResponse = { result: 'ok' };

    jest.spyOn(service, 'deleteDocxFile').mockResolvedValue(deleteResponse);

    const result = await service.deleteDocxFile(publicId);

    expect(result).toEqual(deleteResponse);
  });

  it('should get file URL', async () => {
    const publicId = 'test_public_id';
    const fileUrl = 'test_file_url';

    jest.spyOn(service, 'getFileUrl').mockResolvedValue(fileUrl);

    const result = await service.getFileUrl(publicId);

    expect(result).toEqual(fileUrl);
  });

  it('should extract public ID from URL', () => {
    const fileUrl =
      'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1647778468/test_public_id.jpg';
    const publicId = 'test_public_id';

    const result = service.extractPublicIdFromUrl(fileUrl);

    expect(result).toEqual(publicId);
  });

  it('should extract public ID from DOCX URL', () => {
    const fileUrl =
      'https://res.cloudinary.com/dnjkwuc7p/raw/upload/v1647778468/test_docx_public_id.docx';
    const publicId = 'test_docx_public_id.docx';

    const result = service.extractPublicIdFromDocxUrl(fileUrl);

    expect(result).toEqual(publicId);
  });
});
