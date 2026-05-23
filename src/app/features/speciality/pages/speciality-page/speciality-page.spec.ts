import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialityPage } from './speciality-page';

describe('SpecialityPage', () => {
  let component: SpecialityPage;
  let fixture: ComponentFixture<SpecialityPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialityPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialityPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
