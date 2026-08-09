import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { LangStripComponent } from './components/lang-strip/lang-strip.component';
import { ContinueReadingComponent } from './components/continue-reading/continue-reading.component';
import { TrendingComponent } from './components/trending/trending.component';
import { AuthorsComponent } from './components/authors/authors.component';
import { CompetitionBannerComponent } from './components/competition-banner/competition-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    LangStripComponent,
    ContinueReadingComponent,
    TrendingComponent,
    AuthorsComponent,
    CompetitionBannerComponent,
  ],
  template: `
    <app-hero></app-hero>
    <app-lang-strip></app-lang-strip>
    <app-continue-reading></app-continue-reading>
    <app-trending></app-trending>
    <app-authors></app-authors>
    <app-competition-banner></app-competition-banner>
  `,
})
export class HomeComponent {}
