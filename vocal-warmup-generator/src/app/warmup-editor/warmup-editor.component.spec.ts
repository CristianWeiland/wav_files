import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupEditorComponent } from './warmup-editor.component';

describe('WarmupEditorComponent', () => {
  let component: WarmupEditorComponent;
  let fixture: ComponentFixture<WarmupEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarmupEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
