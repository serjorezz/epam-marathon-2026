import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { HeaderComponent } from './header.component';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { NotificationsService } from '@app/services/notifications/notifications.service';
import { TranslationService } from '@app/services/translation/translation.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let authMock: jasmine.SpyObj<AuthenticationService>;
  let notificationsMock: jasmine.SpyObj<NotificationsService>;

  beforeEach(async () => {
    authMock = jasmine.createSpyObj<AuthenticationService>(
      'AuthenticationService',
      ['signOut'],
    {
      user$: of(null),
      isAuthorised$: of(false),
    },
  );
  
  notificationsMock = jasmine.createSpyObj<NotificationsService>(
    'NotificationsService',
    ['loadNotifications', 'markAsRead'],
  );

  notificationsMock.loadNotifications.and.returnValue(of([]));
  notificationsMock.markAsRead.and.returnValue(of(void 0));

  await TestBed.configureTestingModule({
    providers: [
      { provide: API_BASE_URL, useValue: 'https://test.api' },
      { provide: AuthenticationService, useValue: authMock },
      { provide: NotificationsService, useValue: notificationsMock },
      provideRouter([]),
    ],
    imports: [HeaderComponent],
  }).compileComponents();

  fixture = TestBed.createComponent(HeaderComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

  afterEach(() => {
    const translationService = TestBed.inject(TranslationService);
    translationService.setLanguage('en');
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render "Menu" link instead of "Main page" for unauthenticated visitors', () => {
    const navLinks = fixture.nativeElement.querySelectorAll('.nav a.nav-link');
    const linkTexts = Array.from(navLinks as NodeListOf<HTMLAnchorElement>).map((el) => el.textContent?.trim());
    expect(linkTexts).toContain('Menu');
    expect(linkTexts).not.toContain('Main page');
  });

  it("should toggle language dropdown and select language", () => {
    expect(component.showLanguageDropdown()).toBeFalse();

    component.toggleLanguageDropdown();
    expect(component.showLanguageDropdown()).toBeTrue();

    component.selectLanguage("uk");
    expect(component.showLanguageDropdown()).toBeFalse();
    expect(component.activeLanguage().code).toBe("uk");

    component.selectLanguage("ka");
    expect(component.activeLanguage().code).toBe("ka");
  });
});
