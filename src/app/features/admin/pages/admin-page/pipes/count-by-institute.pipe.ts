import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countByInstitute',
  standalone: true,
})
export class CountByInstitutePipe implements PipeTransform {
  transform(items: any[], instituteId: string): number {
    if (!items || !instituteId) return 0;

    return items.filter((item) => item.institute_id === instituteId).length;
  }
}
