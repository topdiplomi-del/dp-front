import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Institute } from './institute.model';

@Injectable({ providedIn: 'root' })
export class InstituteService {
  private readonly apiUrl = 'https://ontu-prof-serv-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Institute[]> {
    return this.http.get<Institute[]>(`${this.apiUrl}/institutes`);
  }

  getById(id: string): Observable<Institute> {
    return this.http.get<Institute>(`${this.apiUrl}/institutes/${id}`);
  }
}
