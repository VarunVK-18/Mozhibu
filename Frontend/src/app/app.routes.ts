import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/user/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'story/:id',
    loadComponent: () =>
      import('./features/story/story-detail/story-detail.component').then(m => m.StoryDetailComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./features/categories/category-detail/category-detail.component').then(m => m.CategoryDetailComponent),
  },
  {
    path: 'read/:storyId',
    loadComponent: () => import('./features/reader/reader.component').then(m => m.ReaderComponent),
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-reading',
    loadComponent: () => import('./features/my-reading/my-reading.component').then(m => m.MyReadingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'write',
    loadComponent: () => import('./features/write/author-studio.component').then(m => m.AuthorStudioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'write/new',
    loadComponent: () => import('./features/write/story-editor.component').then(m => m.StoryEditorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'community',
    loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
  },
  {
    path: 'competitions',
    loadComponent: () => import('./shared/components/placeholder-page/placeholder-page.component').then(m => m.PlaceholderPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./features/admin/overview/overview.component').then(m => m.OverviewComponent) },
      { path: 'books', loadComponent: () => import('./features/admin/books/books.component').then(m => m.BooksComponent) },
      { path: 'books/:id', loadComponent: () => import('./features/admin/book-detail/book-detail.component').then(m => m.BookDetailComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'authors', loadComponent: () => import('./features/admin/authors/authors.component').then(m => m.AuthorsComponent) },
      { path: 'author-approvals', loadComponent: () => import('./features/admin/author-approvals/author-approvals.component').then(m => m.AuthorApprovalsComponent) },
      { path: 'authors/:id', loadComponent: () => import('./features/admin/author-detail/author-detail.component').then(m => m.AuthorDetailComponent) },
      { path: 'broadcast', loadComponent: () => import('./features/admin/broadcast/broadcast.component').then(m => m.BroadcastComponent) }
    ]
  },
  { path: '**', redirectTo: '' },
];
