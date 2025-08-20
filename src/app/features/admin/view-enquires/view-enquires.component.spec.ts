import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEnquiresComponent } from './view-enquires.component';

describe('ViewEnquiresComponent', () => {
  let component: ViewEnquiresComponent;
  let fixture: ComponentFixture<ViewEnquiresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEnquiresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEnquiresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
