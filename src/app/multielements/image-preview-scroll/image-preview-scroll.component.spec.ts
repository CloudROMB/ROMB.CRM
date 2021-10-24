import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePreviewScrollComponent } from './image-preview-scroll.component';

describe('ImagePreviewScrollComponent', () => {
  let component: ImagePreviewScrollComponent;
  let fixture: ComponentFixture<ImagePreviewScrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagePreviewScrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagePreviewScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
