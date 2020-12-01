import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupsListComponent } from './warmups-list.component';

describe('WarmupsListComponent', () => {
  let component: WarmupsListComponent;
  let fixture: ComponentFixture<WarmupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarmupsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
