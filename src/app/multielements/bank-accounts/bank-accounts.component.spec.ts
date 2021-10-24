import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountsComponent } from './bank-accounts.component';

describe('BankAccountsComponent', () => {
  let component: BankAccountsComponent;
  let fixture: ComponentFixture<BankAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
