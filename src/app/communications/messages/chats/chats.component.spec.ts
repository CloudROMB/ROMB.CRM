import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsListComponent } from './chats.component';

describe('ListComponent', () => {
  let component: ChatsListComponent;
  let fixture: ComponentFixture<ChatsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
