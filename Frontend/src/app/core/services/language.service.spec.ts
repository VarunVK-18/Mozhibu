import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LanguageService]
    });
    service = TestBed.inject(LanguageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created and default to English if no localStorage value', () => {
    expect(service.currentLang()).toBe('en');
    const req = httpMock.expectOne('assets/i18n/en.json');
    req.flush({ nav: { home: 'Home' } });
  });

  it('should initialize from localStorage if available', () => {
    // Flush the pending request from the beforeEach initialization
    const initialReq = httpMock.expectOne('assets/i18n/en.json');
    initialReq.flush({});
    
    localStorage.setItem('preferredLang', 'hi');
    const httpClient = TestBed.inject(HttpClient);
    const customService = new LanguageService(httpClient);
    
    expect(customService.currentLang()).toBe('hi');
    const req = httpMock.expectOne('assets/i18n/hi.json');
    req.flush({ nav: { home: 'होम' } });
  });

  it('should update language, save to localStorage, and fetch new translations', () => {
    // initial flush for 'en' triggered by beforeEach
    const initialReq = httpMock.expectOne('assets/i18n/en.json');
    initialReq.flush({ nav: { home: 'Home' } });

    // Action: Change language to Tamil
    service.setLanguage('ta');

    // Assertions
    expect(service.currentLang()).toBe('ta');
    expect(localStorage.getItem('preferredLang')).toBe('ta');

    // It should request Tamil translations
    const taReq = httpMock.expectOne('assets/i18n/ta.json');
    expect(taReq.request.method).toBe('GET');
    taReq.flush({ nav: { home: 'முகப்பு' } });
  });

  it('should correctly translate keys', () => {
    const initialReq = httpMock.expectOne('assets/i18n/en.json');
    initialReq.flush({
      libraryPage: {
        title: 'Your Library'
      }
    });

    const translation = service.translate('libraryPage.title');
    expect(translation).toBe('Your Library');
  });

  it('should return the key if translation is missing', () => {
    const initialReq = httpMock.expectOne('assets/i18n/en.json');
    initialReq.flush({});

    const translation = service.translate('missing.key');
    expect(translation).toBe('missing.key');
  });
});
