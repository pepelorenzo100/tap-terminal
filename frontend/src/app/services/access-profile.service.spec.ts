import { TestBed } from '@angular/core/testing';

import { AccessProfileService } from './access-profile.service';

describe('AccessProfileService', () => {
  let service: AccessProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
