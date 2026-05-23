import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from './auth.service';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Unwrap { success, data } envelope — returns data or the response as-is. */
function unwrap<T>(response: any): T {
  if (response?.success === true && response?.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

/** Ensure the result is always a plain array. */
function toArray<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly adminBase = `${environment.apiUrl}/api/admin`;
  private readonly publicBase = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private get authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ─────────────────────────────
  // INSTITUTES
  // ─────────────────────────────

  getInstitutes(): Observable<any[]> {
    return this.http
      .get<any>(`${this.adminBase}/institutes`, { headers: this.authHeaders })
      .pipe(map(toArray));
  }

  getInstituteById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.adminBase}/institutes/${id}`, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  createInstitute(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.adminBase}/institutes`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  updateInstitute(id: string, data: any): Observable<any> {
    console.log(data);
    return this.http
      .put<any>(`${this.adminBase}/institutes/${id}`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  deleteInstitute(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminBase}/institutes/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ─────────────────────────────
  // KNOWLEDGE FIELDS
  // ─────────────────────────────

  getKnowledgeFields(instituteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (instituteId) params = params.set('institute_id', instituteId);
    return this.http
      .get<any>(`${this.adminBase}/knowledge-fields`, { headers: this.authHeaders, params })
      .pipe(map(toArray));
  }

  getKnowledgeFieldById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.adminBase}/knowledge-fields/${id}`, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  createKnowledgeField(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.adminBase}/knowledge-fields`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  updateKnowledgeField(id: string, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.adminBase}/knowledge-fields/${id}`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  deleteKnowledgeField(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminBase}/knowledge-fields/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ─────────────────────────────
  // SPECIALTIES
  // Uses the public router which returns { success, data: [...] }
  // ─────────────────────────────

  getSpecialties(filters?: {
    degree?: string;
    search?: string;
    knowledge_field_id?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.degree) params = params.set('degree', filters.degree);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.knowledge_field_id)
      params = params.set('knowledge_field_id', filters.knowledge_field_id);

    return this.http.get<any>(`${this.publicBase}/specialties`, { params }).pipe(map(toArray));
  }

  getSpecialtyById(id: string): Observable<any> {
    return this.http.get<any>(`${this.publicBase}/specialties/${id}`).pipe(map(unwrap));
  }

  createSpecialty(data: any): Observable<any> {
    const payload = {
      ...data,
      code: data.code || `${data.knowledge_field_code || ''}${Date.now().toString().slice(-2)}`,
    };

    return this.http
      .post<any>(`${this.publicBase}/specialties`, payload, {
        headers: this.authHeaders,
      })
      .pipe(map(unwrap));
  }

  updateSpecialty(id: string, data: any): Observable<any> {
    const payload = {
      ...data,
      code: data.code || `${data.knowledge_field_code || ''}${Date.now().toString().slice(-2)}`,
    };

    return this.http
      .patch<any>(`${this.publicBase}/specialties/${id}`, payload, {
        headers: this.authHeaders,
      })
      .pipe(map(unwrap));
  }

  deleteSpecialty(id: string): Observable<any> {
    return this.http.delete<any>(`${this.publicBase}/specialties/${id}`);
  }

  // ─────────────────────────────
  // COMPANIES
  // ─────────────────────────────

  getCompanies(instituteId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (instituteId) params = params.set('institute_id', instituteId);
    return this.http
      .get<any>(`${this.adminBase}/companies`, { headers: this.authHeaders, params })
      .pipe(map(toArray));
  }

  getCompanyById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.adminBase}/companies/${id}`, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  createCompany(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.adminBase}/companies`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  updateCompany(id: string, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.adminBase}/companies/${id}`, data, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  deleteCompany(id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminBase}/companies/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ─────────────────────────────
  // MEDIA
  // ─────────────────────────────

  getMedia(instituteId: string, type?: string): Observable<any[]> {
    let params = new HttpParams().set('institute_id', instituteId);
    if (type) params = params.set('type', type);
    return this.http
      .get<any>(`${this.adminBase}/media`, { headers: this.authHeaders, params })
      .pipe(map(toArray));
  }

  getMediaById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.adminBase}/media/${id}`, { headers: this.authHeaders })
      .pipe(map(unwrap));
  }

  createMedia(instituteId: string, data: any): Observable<any> {
    return this.http
      .post<any>(
        `${this.adminBase}/media`,
        { ...data, institute_id: instituteId },
        { headers: this.authHeaders },
      )
      .pipe(map(unwrap));
  }

  updateMedia(instituteId: string, id: string, data: any): Observable<any> {
    return this.http
      .put<any>(
        `${this.adminBase}/media/${id}`,
        { ...data, institute_id: instituteId },
        { headers: this.authHeaders },
      )
      .pipe(map(unwrap));
  }

  deleteMedia(instituteId: string, id: string): Observable<any> {
    return this.http.delete<any>(`${this.adminBase}/media/${id}`, {
      headers: this.authHeaders,
      params: new HttpParams().set('institute_id', instituteId),
    });
  }
}
