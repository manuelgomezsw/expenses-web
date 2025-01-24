import { TestBed } from '@angular/core/testing';

import { PaymentstypeService } from './paymentstype.service';

describe('PaymentstypeService', () => {
  let service: PaymentstypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentstypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
