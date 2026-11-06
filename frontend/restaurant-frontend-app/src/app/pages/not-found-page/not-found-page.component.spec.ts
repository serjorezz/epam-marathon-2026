import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundPageComponent', () => {
  let component: NotFoundPageComponent;
  let fixture: ComponentFixture<NotFoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the 404 code and navigation links', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.code-404')?.textContent).toContain('404');
    expect(element.querySelector('a[routerlink="/"]')).toBeTruthy();
    expect(element.querySelector('a[routerlink="/tables"]')).toBeTruthy();
    expect(element.querySelector('.dialog .line')).toBeTruthy();
  });
});
