import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HybridTransactionsModalComponent } from './hybrid-transactions-modal.component';

describe('HybridTransactionsModalComponent', () => {
  let component: HybridTransactionsModalComponent;
  let fixture: ComponentFixture<HybridTransactionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HybridTransactionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HybridTransactionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
