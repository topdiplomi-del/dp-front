import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'instituteName',
  standalone: true,
})
export class InstituteNamePipe implements PipeTransform {
  transform(instituteId: string, institutes: any[]): string {
    if (!institutes || !instituteId) return '';

    const institute = institutes.find((inst) => inst.id === instituteId);

    return institute?.short_name || institute?.name || '—';
  }
}
