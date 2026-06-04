import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Institute } from './institute.model';
import { InstituteService } from './institute.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-institutes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './institutes.component.html',
  styleUrls: ['./institutes.component.css'],
})
export class InstitutesComponent implements OnInit {
  institutes: Institute[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private instituteService: InstituteService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadInstitutes();
  }

  loadInstitutes(): void {
    this.loading = true;

    this.instituteService.getAll().subscribe({
      next: (response: any) => {
        console.log('API RESPONSE:', response);

        let institutesArray: Institute[] = [];

        if (Array.isArray(response)) {
          institutesArray = response;
        }

        else if (Array.isArray(response.data)) {
          institutesArray = response.data;
        }

        else if (Array.isArray(response.institutes)) {
          institutesArray = response.institutes;
        }

        this.institutes = institutesArray
          .filter((i: Institute) => i.is_active)
          .sort((a: Institute, b: Institute) => a.sort_order - b.sort_order);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('ERROR:', err);

        this.error = 'Не вдалося завантажити інститути';
        this.loading = false;
      },
    });
  }

  getNumber(index: number): string {
    return (index + 1).toString().padStart(2, '0');
  }
}
