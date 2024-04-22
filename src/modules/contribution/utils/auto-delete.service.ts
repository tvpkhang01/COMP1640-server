import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContributionService } from '../contribution.service';

@Injectable()
export class AutoDeleteService {
  constructor(private readonly contributionService: ContributionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoDelete() {
    try {
      await this.contributionService.deleteOldContributions();
      console.log('Delete executed successfully');
    } catch (error) {
      console.error('Error while auto-deleting contributions:', error);
    }
  }
}

// @Injectable()
// export class MySchedulerService {
//   constructor(
//     private readonly ebayService: EbayService,
//     private readonly categoryService: CategoryService,
//   ) {}
//   @Cron(CronExpression.EVERY_30_MINUTES) async handleCron() {
//     try {
//       const categories = await this.categoryService.findAll();
//       for (const category of categories) {
//         await this.ebayService.searchItems(category.englishName);
//       }
//       console.log('Search executed successfully');
//     } catch (error) {
//       console.error('Error executing search:', error);
//     }
//   }
// }
