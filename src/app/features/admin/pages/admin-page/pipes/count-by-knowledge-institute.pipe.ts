import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countByKnowledgeInstitute',
  standalone: true,
})
export class CountByKnowledgeInstitutePipe implements PipeTransform {
  transform(items: any[], instituteId: string): number {
    if (!items || !instituteId) return 0;

    return items.filter((item) => item.knowledge_field?.institute_id === instituteId).length;
  }
}
