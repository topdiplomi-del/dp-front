import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { FooterComponent } from '../../../../layout/footer/footer.component';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { environment } from '../../../../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';

// ─── API types ────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Institute {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
  video_url: string | null;
  sort_order: number;
  is_active: boolean;
  color: string | null;
}

interface KnowledgeField {
  id: string;
  institute_id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface Specialty {
  id: string;
  knowledge_field_id: string;
  name: string;
  degree: 'BACHELOR' | 'MASTER' | 'PHD';
  study_years: number | null;
  description: string | null;
  program_description: string | null;
  graduates_count: number | null;
  employers_count: number | null;
  employment_rate: number | null;
  has_budget: boolean;
  has_contract: boolean;
  is_active: boolean;
  sort_order: number;
  disciplines?: Discipline[];
  career_roles?: CareerRole[];
}

interface Discipline {
  id: string;
  specialty_id: string;
  name: string;
  type: 'fundamental' | 'profile' | 'specialty';
  sort_order: number;
}

interface CareerRole {
  id: string;
  specialty_id: string;
  title: string;
  description: string | null;
  sort_number: number;
}

interface Company {
  id: string;
  institute_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface InstituteMedia {
  id: string;
  institute_id: string;
  type: 'video' | 'photo' | 'docs';
  url: string;
  caption: string | null;
  sort_order: number;
}

interface TreeNode {
  field: KnowledgeField;
  specialties: Specialty[];
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-department-page',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeaderComponent],
  templateUrl: './department-page.html',
  styleUrls: ['./department-page.css'],
})
export class DepartmentPage implements OnInit, OnDestroy {
  private readonly base = environment.apiUrl || 'https://ontu-prof-serv-production.up.railway.app/';

  // State
  loading = true;
  error: string | null = null;
  specialtiesLoading = false;
  specialtyLoading = false;
  scrollProgress = 0;

  // Data
  instituteId = '';
  institute: Institute | null = null;
  knowledgeFields: KnowledgeField[] = [];
  specialties: Specialty[] = [];
  companies: Company[] = [];
  media: InstituteMedia[] = [];
  treeData: TreeNode[] = [];
  activeSpecialty: Specialty | null = null;

  private scrollHandler: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.error = 'Інститут не знайдено';
        this.loading = false;
        return;
      }
      this.instituteId = decodeURIComponent(id);
      this.loadAll();
    });

    this.initScrollProgress();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler);
      }
      document.body.style.overflow = '';
    }
  }

  // ─── Data loading ──────────────────────────────────────────────────────────

  loadAll(): void {
    this.loading = true;
    this.error = null;
    this.institute = null;
    this.knowledgeFields = [];
    this.specialties = [];
    this.companies = [];
    this.media = [];
    this.treeData = [];

    forkJoin({
      institute: this.getData<Institute | null>(
        `${this.base}/api/institutes/${this.instituteId}`,
        null,
      ),
      knowledgeFields: this.getData<any>(
        `${this.base}/api/knowledge-fields?institute_id=${this.instituteId}`,
        [],
      ),
      companies: this.getData<any>(
        `${this.base}/api/companies?institute_id=${this.instituteId}`,
        [],
      ),
      media: this.getData<any>(`${this.base}/api/institutes/${this.instituteId}/media`, []),
    }).subscribe({
      next: ({ institute, knowledgeFields, companies, media }) => {
        if (!institute) {
          this.error = 'Інститут не знайдено';
          this.loading = false;
          return;
        }

        this.institute = institute;

        this.knowledgeFields = this.normalizeArray<KnowledgeField>(knowledgeFields)
          .filter((item) => item?.is_active)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        this.companies = this.normalizeArray<Company>(companies)
          .filter((item) => item?.is_active)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        this.media = this.normalizeArray<InstituteMedia>(media).sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        );

        this.loading = false;
        this.cdr.detectChanges();

        if (this.knowledgeFields.length) {
          this.loadSpecialties();
        }
      },
      error: () => {
        this.error = 'Помилка завантаження даних';
        this.loading = false;
      },
    });
  }

  private loadSpecialties(): void {
    if (!this.knowledgeFields.length) {
      this.specialties = [];
      this.treeData = [];
      this.specialtiesLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.specialtiesLoading = true;

    const requests = this.knowledgeFields.map((field) =>
      this.getData<any[]>(
        `${this.base}/api/specialties?knowledge_field_id=${encodeURIComponent(field.id)}`,
        [],
      ),
    );
    console.log('st');
    forkJoin(requests).subscribe({
      next: (results) => {
        console.log('result');
        this.specialties = results
          .flatMap((items) => this.normalizeArray<Specialty>(items))
          .filter((item) => item?.is_active)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        this.buildTree();

        this.specialtiesLoading = false;
      },

      error: () => {
        this.specialties = [];
        this.treeData = [];

        this.specialtiesLoading = false;
      },
    });
  }

  private buildTree(): void {
    this.treeData = this.knowledgeFields.map((field) => ({
      field,
      specialties: this.specialties
        .filter((s) => s.knowledge_field_id === field.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
  }

  // ─── Specialty overlay ─────────────────────────────────────────────────────

  openSpecialty(specialty: Specialty): void {
    this.activeSpecialty = specialty;
    this.specialtyLoading = true;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }

    this.getData<Specialty | null>(`${this.base}/api/specialties/${specialty.id}`, null).subscribe({
      next: (data) => {
        if (data) this.activeSpecialty = data;
        this.specialtyLoading = false;
      },
      error: () => {
        this.specialtyLoading = false;
      },
    });
  }

  closeSpecialty(): void {
    this.activeSpecialty = null;
    this.specialtyLoading = false;

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  // ─── Computed ──────────────────────────────────────────────────────────────

  get mainVideoUrl(): SafeResourceUrl | null {
    const raw =
      this.institute?.video_url ?? this.media.find((m) => m.type === 'video')?.url ?? null;

    if (!raw) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.toEmbedUrl(raw));
  }

  get photos(): InstituteMedia[] {
    return this.media.filter((m) => m.type === 'photo');
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  getDisciplinesByType(specialty: Specialty, type: string): Discipline[] {
    return (specialty.disciplines ?? [])
      .filter((d) => d.type === type)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  degreeLabel(degree: string): string {
    const map: Record<string, string> = {
      BACHELOR: 'Бакалавр',
      MASTER: 'Магістр',
      PHD: 'PhD',
    };
    return map[degree] ?? degree;
  }

  formatGraduates(count: number | null): string {
    if (!count) return '';
    return count >= 1000 ? `${Math.floor(count / 1000)}К+` : `${count}+`;
  }

  trackById(_: number, item: any): string {
    return item?.id ?? _;
  }

  private toEmbedUrl(url: string): string {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : url;
  }

  private initScrollProgress(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scrollHandler = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      this.scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private unwrapResponse<T>(response: any, fallback: T): T {
    if (
      response &&
      typeof response === 'object' &&
      response.success === true &&
      response.data !== undefined
    ) {
      return response.data as T;
    }
    return response ?? fallback;
  }

  private normalizeArray<T>(value: any): T[] {
    if (Array.isArray(value)) return value;
    if (value?.data && Array.isArray(value.data)) return value.data;
    if (value?.rows && Array.isArray(value.rows)) return value.rows;
    return [];
  }

  private getData<T>(url: string, fallback: T) {
    return this.http.get<ApiResponse<T> | T>(url).pipe(
      map((response) => this.unwrapResponse<T>(response, fallback)),
      catchError(() => of(fallback)),
    );
  }
}
