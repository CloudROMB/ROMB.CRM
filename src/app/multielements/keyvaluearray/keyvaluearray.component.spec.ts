import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyvaluearrayComponent } from './keyvaluearray.component';

describe('KeyvaluearrayComponent', () => {
  let component: KeyvaluearrayComponent;
  let fixture: ComponentFixture<KeyvaluearrayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyvaluearrayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyvaluearrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
