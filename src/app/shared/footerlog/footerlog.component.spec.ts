import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterlogComponent } from './footerlog.component';

describe('FooterlogComponent', () => {
  let component: FooterlogComponent;
  let fixture: ComponentFixture<FooterlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterlogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
