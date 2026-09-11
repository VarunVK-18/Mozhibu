import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent implements OnInit {
  public auth = inject(AuthService);
  private router = inject(Router);

  missingPenName = computed(() => !this.auth.user()?.penName);
  missingLegalName = computed(() => !this.auth.user()?.legalName);
  missingDob = computed(() => !this.auth.user()?.dob);

  get missingLabel(): string {
    const parts: string[] = [];
    if (this.missingPenName()) parts.push('Pen Name');
    if (this.missingLegalName()) parts.push('Legal Name');
    if (this.missingDob()) parts.push('Date of Birth');
    
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    
    const last = parts.pop();
    return `${parts.join(', ')}, and ${last}`;
  }

  ngOnInit(): void {
    const user = this.auth.user();
    if (!user) {
      this.router.navigate(['/login']);
    }
  }

  goToSettings() {
    this.router.navigate(['/settings'], { fragment: 'profile' });
  }
}
