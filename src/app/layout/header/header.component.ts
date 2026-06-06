import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface SearchResult {
  id: string;
  type: 'institute' | 'specialty';
  title: string;
  subtitle: string;
  url: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchOpen = false;
  results: SearchResult[] = [];
  showDropdown = false;
  searching = false;

  private institutes: any[] = [];
  private searchSubject = new Subject<string>();
  private sub = new Subscription();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.http
      .get<any>(`${environment.apiUrl}/api/institutes`)
      .pipe(catchError(() => of([])))
      .subscribe((res) => {
        this.institutes = Array.isArray(res) ? res : (res?.data ?? []);
      });

    this.sub.add(
      this.searchSubject
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((query) => {
            if (!query.trim()) return of([]);
            this.searching = true;

            const q = query.toLowerCase();
            const instituteResults: SearchResult[] = this.institutes
              .filter(
                (i) =>
                  i.name?.toLowerCase().includes(q) ||
                  i.short_name?.toLowerCase().includes(q),
              )
              .slice(0, 3)
              .map((i) => ({
                id: i.id,
                type: 'institute' as const,
                title: i.name,
                subtitle: i.short_name ?? '',
                url: `/department/${i.id}`,
              }));

            return this.http
              .get<any>(
                `${environment.apiUrl}/api/specialties?search=${encodeURIComponent(query)}`,
              )
              .pipe(
                map((res) => {
                  const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);
                  const specialtyResults: SearchResult[] = items
                    .filter((s) => s.is_active !== false)
                    .slice(0, 6)
                    .map((s) => ({
                      id: s.id,
                      type: 'specialty' as const,
                      title: s.name,
                      subtitle: this.degreeLabel(s.degree),
                      url: `/speciality/${s.id}`,
                    }));
                  return [...instituteResults, ...specialtyResults];
                }),
                catchError(() => of(instituteResults)),
              );
          }),
        )
        .subscribe((results) => {
          this.results = results;
          this.searching = false;
        }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    if (!value.trim()) {
      this.results = [];
      this.showDropdown = false;
      return;
    }
    this.showDropdown = true;
    this.searchSubject.next(value);
  }

  navigate(result: SearchResult): void {
    this.router.navigateByUrl(result.url);
    this.clear();
  }

  onFocus(): void {
    if (this.searchQuery.trim() && this.results.length) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  clear(): void {
    this.searchQuery = '';
    this.results = [];
    this.showDropdown = false;
    this.searchOpen = false;
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) this.clear();
  }

  private degreeLabel(degree: string): string {
    const map: Record<string, string> = {
      BACHELOR: 'Бакалавр',
      MASTER: 'Магістр',
      PHD: 'PhD',
    };
    return map[degree] ?? degree;
  }
}
