import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(
        (m) => m.SignupComponent,
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/user/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: 'story/:id',
    loadComponent: () =>
      import('./features/story/story-detail/story-detail.component').then(
        (m) => m.StoryDetailComponent,
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./features/categories/category-detail/category-detail.component').then(
        (m) => m.CategoryDetailComponent,
      ),
  },
  {
    path: 'read/:storyId',
    loadComponent: () =>
      import('./features/reader/reader.component').then(
        (m) => m.ReaderComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./features/library/library.component').then(
        (m) => m.LibraryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-reading',
    redirectTo: 'profile',
  },
  {
    path: 'write',
    loadComponent: () =>
      import('./features/write/author-studio.component').then(
        (m) => m.AuthorStudioComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/new',
    loadComponent: () =>
      import('./features/write/story-editor.component').then(
        (m) => m.StoryEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id',
    loadComponent: () =>
      import('./features/write/story-dashboard.component').then(
        (m) => m.StoryDashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/settings',
    loadComponent: () =>
      import('./features/write/story-settings.component').then(
        (m) => m.StorySettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/chapter/new',
    loadComponent: () =>
      import('./features/write/chapter-editor.component').then(
        (m) => m.ChapterEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'write/book/:id/chapter/:chapterId',
    loadComponent: () =>
      import('./features/write/chapter-editor.component').then(
        (m) => m.ChapterEditorComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'author/:id',
    loadComponent: () =>
      import('./features/author-profile/author-profile.component').then(
        (m) => m.AuthorProfileComponent,
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'community',
    loadComponent: () =>
      import('./features/community/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'subscription/plans',
    loadComponent: () =>
      import('./features/subscription/subscription-plans.component').then(
        (m) => m.SubscriptionPlansComponent,
      ),
  },
  {
    path: 'subscription/me',
    loadComponent: () =>
      import('./features/subscription/subscription-me.component').then(
        (m) => m.SubscriptionMeComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'earnings',
    loadComponent: () =>
      import('./features/earnings/author-earnings.component').then(
        (m) => m.AuthorEarningsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rewards',
    loadComponent: () =>
      import('./features/rewards/reader-rewards.component').then(
        (m) => m.ReaderRewardsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'competitions',
    loadComponent: () =>
      import('./shared/components/placeholder-page/placeholder-page.component').then(
        (m) => m.PlaceholderPageComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./features/admin/books/books.component').then(
            (m) => m.BooksComponent,
          ),
      },
      {
        path: 'books/:id',
        loadComponent: () =>
          import('./features/admin/book-detail/book-detail.component').then(
            (m) => m.BookDetailComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then(
            (m) => m.UsersComponent,
          ),
      },
      {
        path: 'authors',
        loadComponent: () =>
          import('./features/admin/authors/authors.component').then(
            (m) => m.AuthorsComponent,
          ),
      },
      {
        path: 'author-approvals',
        loadComponent: () =>
          import('./features/admin/author-approvals/author-approvals.component').then(
            (m) => m.AuthorApprovalsComponent,
          ),
      },
      {
        path: 'authors/:id',
        loadComponent: () =>
          import('./features/admin/author-detail/author-detail.component').then(
            (m) => m.AuthorDetailComponent,
          ),
      },
      {
        path: 'broadcast',
        loadComponent: () =>
          import('./features/admin/broadcast/broadcast.component').then(
            (m) => m.BroadcastComponent,
          ),
      },
      {
        path: 'competition',
        loadComponent: () =>
          import('./features/admin/competition/competition.component').then(
            (m) => m.AdminCompetitionComponent,
          ),
      },
      {
        path: 'competition/history/:id',
        loadComponent: () =>
          import('./features/admin/competition/competition-history-detail.component').then(
            (m) => m.CompetitionHistoryDetailComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
    ],
  },

  // Static Footer Pages - Distinct Layouts
  {
    path: 'about',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },
  {
    path: 'careers',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },
  {
    path: 'press',
    loadComponent: () =>
      import('./features/company/about.component').then(
        (m) => m.AboutComponent,
      ),
  },

  {
    path: 'blog',
    loadComponent: () =>
      import('./features/company/blog.component').then((m) => m.BlogComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/company/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },

  {
    path: 'help',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'guidelines',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },
  {
    path: 'writers',
    loadComponent: () =>
      import('./features/company/community.component').then(
        (m) => m.CommunityComponent,
      ),
  },

  // Legal Pages (Shared Template)
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { title: 'Terms of Service' },
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { title: 'Privacy Policy' },
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { title: 'Cookie Policy' },
  },
  {
    path: 'copyright',
    loadComponent: () =>
      import('./features/info/info-page.component').then(
        (m) => m.InfoPageComponent,
      ),
    data: { title: 'Copyright' },
  },

  { path: '**', redirectTo: '' },
];
// force angular recompile
