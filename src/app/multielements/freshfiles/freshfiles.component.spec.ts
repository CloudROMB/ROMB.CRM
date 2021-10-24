import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreshfilesComponent } from './freshfiles.component';

describe('FreshfilesComponent', () => {
  let component: FreshfilesComponent;
  let fixture: ComponentFixture<FreshfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreshfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreshfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
