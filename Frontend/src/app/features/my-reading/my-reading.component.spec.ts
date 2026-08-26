import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyReadingComponent } from './my-reading.component';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('MyReadingComponent', () => {
  let component: MyReadingComponent;
  let fixture: ComponentFixture<MyReadingComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getReadingProgress']);
    // Setup default mock return
    spy.getReadingProgress.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MyReadingComponent],
      providers: [
        { provide: AuthService, useValue: spy },
        provideRouter([]), // Mock router for routerLink
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(MyReadingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Need to trigger change detection to run ngOnInit
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display empty state when reading history is empty', () => {
    authServiceSpy.getReadingProgress.and.returnValue(of([]));
    fixture.detectChanges(); // trigger ngOnInit

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.active-book-banner-clean')).toBeFalsy();
  });

  it('should populate recentlyRead and readingHistory on valid data', () => {
    const mockProgress = [
      {
        _id: '1',
        book: {
          _id: 'b1',
          title: 'Book 1',
          cover: 'cover1.jpg',
          author: { username: 'Author 1' },
          chapters: new Array(10),
        },
        currentChapter: { order: 2 },
        progressPercentage: 20,
        lastReadAt: new Date().toISOString(),
      },
      {
        _id: '2',
        book: {
          _id: 'b2',
          title: 'Book 2',
          cover: 'cover2.jpg',
          author: 'Author 2',
          chapters: new Array(5),
        },
        currentChapter: 1,
        progressPercentage: 10,
        lastReadAt: new Date().toISOString(),
      },
    ];

    authServiceSpy.getReadingProgress.and.returnValue(of(mockProgress));
    fixture.detectChanges(); // trigger ngOnInit

    expect(component.recentlyRead()?.title).toBe('Book 1');
    expect(component.readingHistory().length).toBe(1);
    expect(component.readingHistory()[0].title).toBe('Book 2');

    // Verify UI reflects data
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeFalsy();
    expect(compiled.querySelector('.active-book-banner-clean')).toBeTruthy();
    expect(
      compiled.querySelector('.active-info-card h2')?.textContent,
    ).toContain('Book 1');
  });
});
