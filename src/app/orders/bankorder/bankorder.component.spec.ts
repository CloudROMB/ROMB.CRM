import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankorderComponent } from './bankorder.component';

describe('BankorderComponent', () => {
  let component: BankorderComponent;
  let fixture: ComponentFixture<BankorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
