import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionBannerComponent } from './competition-banner.component';
import {
  CompetitionService,
  CompetitionConfig,
} from '../../../../core/services/competition.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CompetitionBannerComponent', () => {
  let component: CompetitionBannerComponent;
  let fixture: ComponentFixture<CompetitionBannerComponent>;
  let mockCompetitionService: jasmine.SpyObj<CompetitionService>;

  beforeEach(async () => {
    mockCompetitionService = jasmine.createSpyObj('CompetitionService', [
      'getActiveCompetition',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CompetitionBannerComponent,
        TranslatePipe,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should not render banner when isActive is false', () => {
    mockCompetitionService.getActiveCompetition.and.returnValue(
      of({
        isActive: false,
        tag: 'Test',
        title: 'Test Title',
        description: 'Desc',
        endDate: new Date().toISOString(),
        buttonText: 'Submit',
      } as CompetitionConfig),
    );

    fixture = TestBed.createComponent(CompetitionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const bannerElement = fixture.nativeElement.querySelector('.competition');
    expect(bannerElement).toBeFalsy();
    expect(component.config).toBeNull();
  });

  it('should render banner when isActive is true', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days in the future
    mockCompetitionService.getActiveCompetition.and.returnValue(
      of({
        isActive: true,
        tag: 'Test',
        title: 'Test Title',
        description: 'Desc',
        endDate: futureDate.toISOString(),
        buttonText: 'Submit',
        buttonLink: '/write?competition=test',
      } as CompetitionConfig),
    );

    fixture = TestBed.createComponent(CompetitionBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const bannerElement = fixture.nativeElement.querySelector('.competition');
    expect(bannerElement).toBeTruthy();
    expect(component.config).toBeTruthy();
    expect(component.config?.isActive).toBe(true);
  });
});
