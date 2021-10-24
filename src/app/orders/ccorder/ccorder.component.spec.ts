import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcorderComponent } from './ccorder.component';

describe('CcorderComponent', () => {
  let component: CcorderComponent;
  let fixture: ComponentFixture<CcorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
