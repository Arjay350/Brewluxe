import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { provideRouter } from '@angular/router';
import { ProductService } from '../services/product.service';
import { WeatherService } from '../services/weather.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: { getAllProducts: () => [], loadProducts: async () => [] } },
        {
          provide: WeatherService,
          useValue: {
            getWeatherRecommendation: async () => ({
              temperature: 29,
              conditionText: 'Sunny',
              icon: '☀️',
              headline: 'Beat the heat with iced drinks!',
              recommendedCategory: 'Frappes',
              tag: 'Beat The Heat',
            }),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
