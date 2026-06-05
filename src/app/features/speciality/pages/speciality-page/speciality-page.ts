import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { HeaderComponent } from '../../../../layout/header/header.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { environment } from '../../../../../environments/environment';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Discipline {
  id: string;
  name: string;
  type: 'fundamental' | 'profile' | 'specialty';
  sort_order: number;
}

interface CareerRole {
  id: string;
  title: string;
  description: string;
  sort_number: number;
}

interface Erasmus {
  title: string | null;
  description: string | null;
  duration_months: number | null;
  is_active: boolean;
}

interface Specialty {
  id: string;
  knowledge_field_id: string;
  knowledge_field_name: string;
  knowledge_field_code: string;
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
  disciplines: Discipline[];
  career_roles: CareerRole[];
  erasmus: Erasmus | null;
  companies?: Company[];
}

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-speciality-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './speciality-page.html',
  styleUrl: './speciality-page.css',
})
export class SpecialityPage implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  // ─── State ─────────────────────────────────────────────────────────────────

  specialty: Specialty | null = null;
  companies: Company[] = [];
  loading = true;
  error = false;
  scrollProgress = 0;

  // ─── Computed ──────────────────────────────────────────────────────────────

  get degreeLabel(): string {
    switch (this.specialty?.degree) {
      case 'BACHELOR':
        return 'Бакалавр';
      case 'MASTER':
        return 'Магістр';
      case 'PHD':
        return 'PhD';
      default:
        return this.specialty?.degree ?? '';
    }
  }

  get fundamentalDisciplines(): Discipline[] {
    return this.specialty?.disciplines?.filter((d) => d.type === 'fundamental') ?? [];
  }

  get profileDisciplines(): Discipline[] {
    return this.specialty?.disciplines?.filter((d) => d.type === 'profile') ?? [];
  }

  get specialtyDisciplines(): Discipline[] {
    return this.specialty?.disciplines?.filter((d) => d.type === 'specialty') ?? [];
  }

  get graduatesFormatted(): string {
    const n = this.specialty?.graduates_count;
    if (!n) return '—';
    if (n >= 1000) return `${Math.round(n / 1000)}К+`;
    return String(n);
  }

  get studyYearsLabel(): string {
    const y = this.specialty?.study_years;
    if (!y) return '—';
    return y % 1 === 0 ? `${y}` : `${y}`;
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    // Load specialty with all related data from public API
    this.http
      .get<any>(`${environment.apiUrl}/api/specialties/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const data: Specialty = response.data ?? response;
        this.specialty = data;
        this.loadCompanies(data.knowledge_field_id);

        this.loading = false;
        this.cdr.detectChanges();
        this.initScrollProgress();
      });
  }

  private loadCompanies(knowledgeFieldId: string): void {
    // Fetch all companies; filter client-side if needed
    // The server returns companies by institute_id, but here we load all
    // and let the template show them (the HTML mock had 6 hardcoded ones)
    this.http
      .get<any>(`${environment.apiUrl}/api/companies`)
      .pipe(catchError(() => of([])))
      .subscribe((res) => {
        this.companies = (res.data ?? res) as Company[];
        this.cdr.detectChanges();
      });
  }

  // ─── Scroll progress ───────────────────────────────────────────────────────

  private initScrollProgress(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
}
