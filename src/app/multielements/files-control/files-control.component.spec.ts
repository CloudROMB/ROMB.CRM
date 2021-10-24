import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesControlComponent } from './files-control.component';

describe('FilesControlComponent', () => {
  let component: FilesControlComponent;
  let fixture: ComponentFixture<FilesControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
