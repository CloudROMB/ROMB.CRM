import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoxexpressComponent } from './foxexpress.component';

describe('FoxexpressComponent', () => {
  let component: FoxexpressComponent;
  let fixture: ComponentFixture<FoxexpressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoxexpressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoxexpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
