import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: ApiService, useValue: spy }],
    });

    service = TestBed.inject(AuthService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch reading progress from the backend', (done) => {
    const mockResponse = [
      {
        _id: '1',
        book: { title: 'Test Book' },
        currentChapter: { order: 5 },
        progressPercentage: 50,
      },
    ];

    apiServiceSpy.get.and.returnValue(of(mockResponse));

    service.getReadingProgress().subscribe((data) => {
      expect(data).toEqual(mockResponse);
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/me/progress');
      expect(apiServiceSpy.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should update reading progress to the backend', (done) => {
    const mockResponse = { success: true };
    apiServiceSpy.post.and.returnValue(of(mockResponse));

    service.updateReadingProgress('book123', 'chap456', 75).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(apiServiceSpy.post).toHaveBeenCalledWith('/users/me/progress', {
        bookId: 'book123',
        chapterId: 'chap456',
        progressPercentage: 75,
      });
      done();
    });
  });
});
