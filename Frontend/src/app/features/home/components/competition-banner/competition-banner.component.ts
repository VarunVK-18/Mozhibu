import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-competition-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './competition-banner.component.html',
  styleUrls: ['./competition-banner.component.css'],
})
export class CompetitionBannerComponent implements OnInit, OnDestroy {
  days = 6;
  hours = 14;
  mins = 52;

  private interval: any;

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.mins--;
      if (this.mins < 0) { this.mins = 59; this.hours--; }
      if (this.hours < 0) { this.hours = 23; this.days--; }
      if (this.days < 0) { this.days = 0; this.hours = 0; this.mins = 0; clearInterval(this.interval); }
    }, 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
