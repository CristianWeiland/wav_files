import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupListComponent } from './warmup-list.component';

describe('WarmupListComponent', () => {
  let component: WarmupListComponent;
  let fixture: ComponentFixture<WarmupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarmupListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
