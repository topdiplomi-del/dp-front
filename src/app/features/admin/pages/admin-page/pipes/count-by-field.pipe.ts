import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countByField',
  standalone: true,
})
export class CountByFieldPipe implements PipeTransform {
  transform(items: any[], fieldId: string): number {
    if (!items || !fieldId) return 0;

    return items.filter((item) => item.knowledge_field_id === fieldId).length;
  }
}
