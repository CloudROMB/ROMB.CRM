import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RefSelectComponent} from './refselect.component';

describe('RefselectComponent', () => {
  let component: RefSelectComponent;
  let fixture: ComponentFixture<RefSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RefSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
