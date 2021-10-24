import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFormsComponent } from './print-forms.component';

describe('PrintFormsComponent', () => {
  let component: PrintFormsComponent;
  let fixture: ComponentFixture<PrintFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
