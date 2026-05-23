import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activeCount',
  standalone: true,
})
export class ActiveCountPipe implements PipeTransform {
  transform(items: any[]): number {
    if (!items) return 0;

    return items.filter((item) => item.is_active).length;
  }
}
