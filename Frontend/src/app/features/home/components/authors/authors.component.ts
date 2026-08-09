import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface Author {
  initials: string;
  name: string;
  followers: string;
  color: string;
  following: boolean;
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
})
export class AuthorsComponent {
  authors = signal<Author[]>([
    { initials: 'DR', name: 'Devika Rao',    followers: '24.3K', color: '#3F6259', following: false },
    { initials: 'AM', name: 'Arjun Mehta',   followers: '19.8K', color: '#AE6274', following: false },
    { initials: 'AS', name: 'Anitha Suresh', followers: '15.1K', color: '#8A7B5C', following: false },
    { initials: 'SB', name: 'Sohini Basu',   followers: '12.6K', color: '#5E6B7A', following: false },
    { initials: 'RT', name: 'Ravi Teja N.',  followers: '31.2K', color: '#B08655', following: false },
  ]);

  toggleFollow(index: number): void {
    this.authors.update(list =>
      list.map((a, i) => i === index ? { ...a, following: !a.following } : a)
    );
  }
}
