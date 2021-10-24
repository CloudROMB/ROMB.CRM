import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttentionsComponent } from './attentions.component';

describe('AttentionsComponent', () => {
  let component: AttentionsComponent;
  let fixture: ComponentFixture<AttentionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttentionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttentionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
