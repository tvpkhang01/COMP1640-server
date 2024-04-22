import { Module } from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { MagazineController } from './magazine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Magazine } from 'src/entities/magazine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Magazine])],
  controllers: [MagazineController],
  providers: [MagazineService],
})
export class MagazineModule {}
