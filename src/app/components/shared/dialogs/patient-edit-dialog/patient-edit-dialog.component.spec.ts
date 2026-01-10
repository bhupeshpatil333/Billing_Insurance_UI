import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEditDialogComponent } from './patient-edit-dialog.component';

describe('PatientEditDialogComponent', () => {
  let component: PatientEditDialogComponent;
  let fixture: ComponentFixture<PatientEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
