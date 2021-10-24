import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflistComponent } from './reflist.component';

describe('ReflistComponent', () => {
  let component: ReflistComponent;
  let fixture: ComponentFixture<ReflistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReflistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReflistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
