import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTooltipComponent } from './dynamic-tooltip.component';

describe('DynamicTooltipComponent', () => {
  let component: DynamicTooltipComponent;
  let fixture: ComponentFixture<DynamicTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
