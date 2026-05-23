import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DepartmentPage } from './department-page';

describe('DepartmentPage', () => {
  let component: DepartmentPage;
  let fixture: ComponentFixture<DepartmentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentPage, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'test-id' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set instituteId from route params', () => {
    expect(component.instituteId).toBe('test-id');
  });

  it('should start in loading state', () => {
    const fresh = TestBed.createComponent(DepartmentPage);
    expect(fresh.componentInstance.loading).toBeTrue();
  });

  it('degreeLabel should map known degrees', () => {
    expect(component.degreeLabel('BACHELOR')).toBe('Бакалавр');
    expect(component.degreeLabel('MASTER')).toBe('Магістр');
    expect(component.degreeLabel('PHD')).toBe('PhD');
  });

  it('degreeLabel should return raw value for unknown degree', () => {
    expect(component.degreeLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('formatGraduates should format large numbers', () => {
    expect(component.formatGraduates(1500)).toBe('1К+');
    expect(component.formatGraduates(500)).toBe('500+');
    expect(component.formatGraduates(null)).toBe('');
  });

  it('closeSpecialty should clear activeSpecialty', () => {
    component.activeSpecialty = { id: '1' } as any;
    component.closeSpecialty();
    expect(component.activeSpecialty).toBeNull();
  });
});
