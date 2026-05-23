import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AdminApiService } from './admin-api.service';
import { AuthService } from './auth.service';
import { ActiveCountPipe } from './pipes/active-count.pipe';
import { CountByFieldPipe } from './pipes/count-by-field.pipe';
import { CountByInstitutePipe } from './pipes/count-by-institute.pipe';
import { CountByKnowledgeInstitutePipe } from './pipes/count-by-knowledge-institute.pipe';
import { InstituteNamePipe } from './pipes/institute-name.pipe';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DrawerType = 'specialty' | 'institute' | 'knowledge' | 'company' | 'media' | '';
type PageId = 'dashboard' | 'institutes' | 'knowledge' | 'specialties' | 'companies' | 'media';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActiveCountPipe,
    CountByInstitutePipe,
    CountByKnowledgeInstitutePipe,
    InstituteNamePipe,
    CountByFieldPipe,
  ],
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css'],
})
export class AdminPage implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private api: AdminApiService,
    public auth: AuthService,
    private router: Router,
  ) {}

  // ─── Data ──────────────────────────────────────────────────────────────────

  institutes: any[] = [];
  knowledgeFields: any[] = [];
  specialties: any[] = [];
  companies: any[] = [];
  media: any[] = [];

  // ─── Loading ───────────────────────────────────────────────────────────────

  loadingPage = '';

  // ─── Navigation ────────────────────────────────────────────────────────────

  readonly titles: Record<string, string> = {
    dashboard: 'Дашборд',
    institutes: 'Інститути',
    knowledge: 'Галузі знань',
    specialties: 'Спеціальності',
    companies: 'Компанії-роботодавці',
    media: 'Медіафайли',
  };

  activePage: PageId = 'dashboard';

  switchPage(id: PageId): void {
    this.activePage = id;
    if (id === 'media') this.activeTab = 'video';
    this.loadPageData(id);
  }

  private loadPageData(page: string): void {
    switch (page) {
      case 'dashboard':
        return this.loadDashboard();
      case 'institutes':
        return this.loadInstitutes();
      case 'knowledge':
        return this.loadKnowledgeFields();
      case 'specialties':
        return this.loadSpecialties();
      case 'companies':
        return this.loadCompanies();
      case 'media':
        return this.loadMedia();
    }
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  dashboardStats = { institutes: 0, specialties: 0, companies: 0, knowledgeFields: 0 };

  loadDashboard(): void {
    this.loadingPage = 'dashboard';
    forkJoin({
      institutes: this.api.getInstitutes().pipe(catchError(() => of([]))),
      specialties: this.api.getSpecialties().pipe(catchError(() => of([]))),
      companies: this.api.getCompanies().pipe(catchError(() => of([]))),
      knowledgeFields: this.api.getKnowledgeFields().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ institutes, specialties, companies, knowledgeFields }) => {
        this.institutes = institutes;
        this.specialties = specialties;
        this.companies = companies;
        this.knowledgeFields = knowledgeFields;
        this.dashboardStats = {
          institutes: institutes.length,
          specialties: specialties.length,
          companies: companies.length,
          knowledgeFields: knowledgeFields.filter((kf: any) => kf.is_active).length,
        };
        this.buildTree();
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження даних', 'error');
        this.loadingPage = '';
      },
    });
  }

  loadInstitutes(): void {
    this.loadingPage = 'institutes';
    this.api.getInstitutes().subscribe({
      next: (data) => {
        this.institutes = data;
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження інститутів', 'error');
        this.loadingPage = '';
      },
    });
  }

  loadKnowledgeFields(instituteId?: string): void {
    this.loadingPage = 'knowledge';
    this.api.getKnowledgeFields(instituteId).subscribe({
      next: (data) => {
        this.knowledgeFields = data;
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження галузей', 'error');
        this.loadingPage = '';
      },
    });
  }

  loadSpecialties(filters?: any): void {
    this.loadingPage = 'specialties';
    this.api.getSpecialties(filters).subscribe({
      next: (data) => {
        this.specialties = data;
        this.buildTree();
        this.loadingPage = '';
      },
      error: () => {
        this.specialties = [];
        this.loadingPage = '';
        this.showToast('Помилка завантаження спеціальностей', 'error');
      },
    });
  }

  loadCompanies(instituteId?: string): void {
    this.loadingPage = 'companies';
    this.api.getCompanies(instituteId).subscribe({
      next: (data) => {
        this.companies = data;
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження компаній', 'error');
        this.loadingPage = '';
      },
    });
  }

  loadMedia(instituteId?: string, type?: string): void {
    const id = instituteId ?? this.selectedMediaInstitute;
    if (!id) {
      this.loadingPage = '';
      return;
    }
    this.api.getMedia(id, type ?? this.activeTab).subscribe({
      next: (data) => {
        this.media = data;
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження медіа', 'error');
        this.loadingPage = '';
      },
    });
  }

  // ─── Drawer ────────────────────────────────────────────────────────────────

  openedDrawer: DrawerType = '';
  editingItem: any = null;

  openDrawer(type: DrawerType, item?: any): void {
    this.openedDrawer = type;
    this.editingItem = item ?? null;

    switch (type) {
      case 'specialty':
        if (item) {
          this.api.getSpecialtyById(item.id).subscribe((data) => {
            this.currentSpecialty = { ...data };
            this.tags = {
              fundamental:
                data.disciplines
                  ?.filter((d: any) => d.type === 'fundamental')
                  .map((d: any) => d.name) ?? [],
              profile:
                data.disciplines
                  ?.filter((d: any) => d.type === 'profile')
                  .map((d: any) => d.name) ?? [],
              specialty:
                data.disciplines
                  ?.filter((d: any) => d.type === 'specialty')
                  .map((d: any) => d.name) ?? [],
            };
            this.roles = data.career_roles ?? [];
          });
        } else {
          this.resetSpecialtyForm();
        }
        break;

      case 'institute':
        this.currentInstitute = item
          ? { ...item }
          : { is_active: true, sort_order: 1, color: '#1a4a2e' };
        break;

      case 'knowledge':
        this.currentKnowledge = item ? { ...item } : { is_active: true, sort_order: 1 };
        break;

      case 'company':
        this.currentCompany = item ? { ...item } : { is_active: true, sort_order: 1 };
        break;

      case 'media':
        this.currentMedia = item
          ? { ...item }
          : {
              type: this.activeTab,
              is_active: true,
              institute_id: this.selectedMediaInstitute,
              sort_order: 1,
            };
        break;
    }

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer(): void {
    this.openedDrawer = '';
    this.editingItem = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  openAddMediaModal(): void {
    this.openDrawer('media');
  }

  // ─── Color picker (institute) ──────────────────────────────────────────────
  // Причина проблеми: Angular [(ngModel)] на input[type=color] не реагує на
  // нативні події браузера коректно — значення оновлюється лише після blur.
  // Рішення: прибираємо ngModel з color-input і обробляємо вручну через
  // (input) та (change), також синхронізуємо текстове HEX-поле.

  onInstituteColorInput(value: string): void {
    this.currentInstitute = { ...this.currentInstitute, color: value };
  }

  /** Валідує hex введений вручну і застосовує якщо правильний */
  onInstituteColorHex(value: string): void {
    const hex = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.currentInstitute = { ...this.currentInstitute, color: hex };
    }
  }

  // ─── Save ──────────────────────────────────────────────────────────────────

  saving = false;

  saveAndClose(type: DrawerType): void {
    if (this.saving) return;
    this.saving = true;
    switch (type) {
      case 'institute':
        this.saveInstitute();
        break;
      case 'knowledge':
        this.saveKnowledge();
        break;
      case 'company':
        this.saveCompany();
        break;
      case 'specialty':
        this.saveSpecialty();
        break;
      case 'media':
        this.saveMedia();
        break;
      default:
        this.saving = false;
    }
  }

  private onSaveSuccess(message: string, reload: () => void): void {
    this.closeDrawer();
    reload();
    this.showToast(message, 'success');
    this.saving = false;
  }

  private onSaveError(e: any): void {
    this.showToast(e?.error?.message ?? 'Помилка збереження', 'error');
    this.saving = false;
  }

  saveInstitute(): void {
    const req = this.editingItem
      ? this.api.updateInstitute(this.editingItem.id, this.currentInstitute)
      : this.api.createInstitute(this.currentInstitute);
    req.subscribe({
      next: () => this.onSaveSuccess('✓ Інститут збережено', () => this.loadInstitutes()),
      error: (e) => this.onSaveError(e),
    });
  }

  saveKnowledge(): void {
    const req = this.editingItem
      ? this.api.updateKnowledgeField(this.editingItem.id, this.currentKnowledge)
      : this.api.createKnowledgeField(this.currentKnowledge);
    req.subscribe({
      next: () =>
        this.onSaveSuccess('✓ Галузь збережено', () =>
          this.loadKnowledgeFields(this.selectedKnowledgeInstituteFilter || undefined),
        ),
      error: (e) => this.onSaveError(e),
    });
  }

  saveCompany(): void {
    const req = this.editingItem
      ? this.api.updateCompany(this.editingItem.id, this.currentCompany)
      : this.api.createCompany(this.currentCompany);
    req.subscribe({
      next: () =>
        this.onSaveSuccess('✓ Компанію збережено', () =>
          this.loadCompanies(this.selectedCompanyInstituteFilter || undefined),
        ),
      error: (e) => this.onSaveError(e),
    });
  }

  saveSpecialty(): void {
    const disciplines = [
      ...this.tags['fundamental'].map((name: string, i: number) => ({
        name,
        type: 'fundamental',
        sort_order: i,
      })),
      ...this.tags['profile'].map((name: string, i: number) => ({
        name,
        type: 'profile',
        sort_order: i,
      })),
      ...this.tags['specialty'].map((name: string, i: number) => ({
        name,
        type: 'specialty',
        sort_order: i,
      })),
    ];
    const payload = { ...this.currentSpecialty, disciplines, career_roles: this.roles };
    const req = this.editingItem
      ? this.api.updateSpecialty(this.editingItem.id, payload)
      : this.api.createSpecialty(payload);
    req.subscribe({
      next: () => this.onSaveSuccess('✓ Спеціальність збережено', () => this.loadSpecialties()),
      error: (e) => this.onSaveError(e),
    });
  }

  saveMedia(): void {
    const req = this.editingItem
      ? this.api.updateMedia(this.selectedMediaInstitute, this.editingItem.id, this.currentMedia)
      : this.api.createMedia(this.selectedMediaInstitute, this.currentMedia);
    req.subscribe({
      next: () => this.onSaveSuccess('✓ Медіа збережено', () => this.loadMedia()),
      error: (e) => this.onSaveError(e),
    });
  }

  // ─── Form models ───────────────────────────────────────────────────────────

  currentInstitute: any = {};
  currentKnowledge: any = {};
  currentCompany: any = {};
  currentSpecialty: any = {};
  currentMedia: any = {};

  resetSpecialtyForm(): void {
    this.currentSpecialty = {
      knowledge_field_id: '',
      name: '',
      degree: 'BACHELOR',
      study_years: 4,
      description: '',
      program_description: '',
      graduates_count: null,
      employers_count: null,
      employment_rate: null,
      has_budget: true,
      has_contract: true,
      is_active: true,
      sort_order: 1,
    };
    this.tags = { fundamental: [], profile: [], specialty: [] };
    this.roles = [];
  }

  // ─── Delete modal ──────────────────────────────────────────────────────────

  deleteTarget = '';
  deleteTargetId = '';
  deleteTargetType = '';
  modalOpen = false;

  confirmDelete(name: string, id: string, type: string): void {
    this.deleteTarget = name;
    this.deleteTargetId = id;
    this.deleteTargetType = type;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  doDelete(): void {
    const id = this.deleteTargetId;
    let req: any;
    switch (this.deleteTargetType) {
      case 'institute':
        req = this.api.deleteInstitute(id);
        break;
      case 'knowledge':
        req = this.api.deleteKnowledgeField(id);
        break;
      case 'specialty':
        req = this.api.deleteSpecialty(id);
        break;
      case 'company':
        req = this.api.deleteCompany(id);
        break;
      case 'media':
        req = this.api.deleteMedia(this.selectedMediaInstitute, id);
        break;
      default:
        this.closeModal();
        return;
    }
    req.subscribe({
      next: () => {
        this.closeModal();
        this.showToast(`🗑️ «${this.deleteTarget}» видалено`, 'error');
        this.loadPageData(this.activePage);
      },
      error: (e: any) => {
        this.closeModal();
        this.showToast(e?.error?.message ?? 'Помилка видалення', 'error');
      },
    });
  }

  // ─── Toasts ────────────────────────────────────────────────────────────────

  toasts: Toast[] = [];

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast: Toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t !== toast);
    }, 3000);
  }

  // ─── Tags (disciplines) ────────────────────────────────────────────────────

  tags: Record<string, string[]> = { fundamental: [], profile: [], specialty: [] };

  addTag(event: KeyboardEvent, section: string): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    if (!this.tags[section]) this.tags[section] = [];
    this.tags[section].push(value);
    input.value = '';
  }

  removeTag(section: string, index: number): void {
    this.tags[section].splice(index, 1);
  }

  // ─── Career roles ──────────────────────────────────────────────────────────

  roles: { title: string; description: string }[] = [];

  addRole(): void {
    this.roles.push({ title: '', description: '' });
  }

  removeRole(index: number): void {
    this.roles.splice(index, 1);
  }

  // ─── Specialties tree ──────────────────────────────────────────────────────

  treeData: { field: any; specs: any[] }[] = [];
  openedTreeSections: string[] = [];

  buildTree(): void {
    const map = new Map<string, { field: any; specs: any[] }>();
    for (const kf of this.knowledgeFields) {
      map.set(kf.id, { field: kf, specs: [] });
    }
    for (const s of this.specialties) {
      map.get(s.knowledge_field_id)?.specs.push(s);
    }
    this.treeData = Array.from(map.values()).filter((n) => n.specs.length > 0);
    this.openedTreeSections = this.treeData.map((n) => n.field.id);
  }

  toggleTree(id: string): void {
    this.openedTreeSections = this.openedTreeSections.includes(id)
      ? this.openedTreeSections.filter((s) => s !== id)
      : [...this.openedTreeSections, id];
  }

  isTreeOpen(id: string): boolean {
    return this.openedTreeSections.includes(id);
  }

  // ─── Filters ───────────────────────────────────────────────────────────────

  activeDegree = 'all';
  searchQuery = '';
  selectedKnowledgeInstituteFilter = '';
  selectedCompanyInstituteFilter = '';
  selectedMediaInstitute = '';

  filterSpecialties(degree: string): void {
    this.activeDegree = degree;
    const filters: any = {};
    if (degree !== 'all') filters.degree = degree;
    if (this.searchQuery) filters.search = this.searchQuery;
    this.loadSpecialties(filters);
  }

  searchSpecialties(value: string): void {
    this.searchQuery = value.trim();
    const filters: any = { search: this.searchQuery };
    if (this.activeDegree !== 'all') filters.degree = this.activeDegree;
    this.loadSpecialties(filters);
  }

  onKnowledgeInstituteChange(instituteId: string): void {
    this.selectedKnowledgeInstituteFilter = instituteId;
    this.loadKnowledgeFields(instituteId || undefined);
  }

  onCompanyInstituteChange(instituteId: string): void {
    this.selectedCompanyInstituteFilter = instituteId;
    this.loadCompanies(instituteId || undefined);
  }

  onMediaInstituteChange(instituteId: string): void {
    this.selectedMediaInstitute = instituteId;
    if (instituteId) {
      this.loadingPage = 'media';
      this.loadMedia(instituteId, this.activeTab);
    } else {
      this.media = [];
    }
  }

  // ─── Media tabs ────────────────────────────────────────────────────────────

  activeTab = 'video';
  uploadZoneHover = false;

  setTab(tab: string): void {
    this.activeTab = tab;
    if (this.selectedMediaInstitute) {
      this.loadingPage = 'media';
      this.loadMedia(this.selectedMediaInstitute, tab);
    }
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadingPage = 'dashboard';

    forkJoin({
      institutes: this.api.getInstitutes().pipe(catchError(() => of([]))),
      knowledgeFields: this.api.getKnowledgeFields().pipe(catchError(() => of([]))),
      specialties: this.api.getSpecialties().pipe(catchError(() => of([]))),
      companies: this.api.getCompanies().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ institutes, knowledgeFields, specialties, companies }) => {
        this.institutes = institutes;
        this.knowledgeFields = knowledgeFields;
        this.specialties = specialties;
        this.companies = companies;
        this.dashboardStats = {
          institutes: institutes.length,
          specialties: specialties.length,
          companies: companies.length,
          knowledgeFields: knowledgeFields.filter((kf: any) => kf.is_active).length,
        };
        this.buildTree();
        this.loadingPage = '';
      },
      error: () => {
        this.showToast('Помилка завантаження даних', 'error');
        this.loadingPage = '';
      },
    });
  }
}
