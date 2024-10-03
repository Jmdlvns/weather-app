import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeatherService } from '../service/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, filter, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedTemperatureUnit: 'celsius' | 'fahrenheit' = 'celsius';
  subscriptions: any = [];
  futureData: any;
  future: any;
  searchForm!: FormGroup;
  searchControl = new FormControl('');
  weather: any;
  forecast: any = [];
  currentCity: string = 'Manila';
  selectedCity: string = 'any';
  selectedDataToShow: string = 'heatIndex';
  weatherCatGif: any;
  weatherGif: any;
  isRainy!: boolean;
  isSunny!: boolean;
  citySuggestions: any[] = []; // To hold city suggestions
  weatherIconGif: string = '../../assets/default.gif'; // Default GIF
  dataOptions: string[] = ['heatIndex', 'windSpeed', 'humidity'];

  constructor(
    private fb: FormBuilder,
    private weatherService: WeatherService
  ) {}
  showLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
  
          this.weatherService.searchWeatherByCoords(latitude, longitude).subscribe(
            (resp) => {
              if (resp && resp.location && resp.location.name && resp.forecast && resp.forecast.forecastday) {
                this.weather = resp;
                this.currentCity = resp.location.name;
                this.forecast = resp.forecast.forecastday;
              }
            }
          );
        },
        
      );
    }
  }
  
  ngOnInit() {
    this.searchForm = this.fb.group({
      city: ['', Validators.required],
    });

    const storedUnit = localStorage.getItem('temperatureUnit');
    if (storedUnit) {
      this.selectedTemperatureUnit = storedUnit as 'celsius' | 'fahrenheit';
    }

    const savedDataOption = localStorage.getItem('dataToShow') || 'heatIndex';
    this.selectedDataToShow = savedDataOption;

    const savedLatitude = localStorage.getItem('currentLatitude');
    const savedLongitude = localStorage.getItem('currentLongitude');
    const locationConsent = localStorage.getItem('locationConsent');

    if (locationConsent === 'true' && savedLatitude && savedLongitude) {
      this.weatherService.searchWeatherByCoords(parseFloat(savedLatitude), parseFloat(savedLongitude)).subscribe(
        (resp) => {
          if (resp && resp.location && resp.location.name && resp.forecast && resp.forecast.forecastday) {
            this.weather = resp;
            this.currentCity = resp.location.name;
            this.forecast = resp.forecast.forecastday;
            this.updateCatGif();
            this.updateWeatherGif();
            this.updateWeatherIconGif();
          } else {
            console.error('Invalid API response format:', resp);
          }
        },
        (error) => {
          console.error('Error fetching weather data:', error);
        }
      );
    } else {
      this.searchWeatherForCity(this.currentCity);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        filter((value) => value != null && value.trim() !== ''),
        switchMap((value) => {
          const searchValue = value as string;
          if (searchValue.trim() === '') {
            return of([]);
          }
          return this.weatherService.searchCity(searchValue);
        }),
        catchError((error) => {
          console.error('Error fetching city suggestions:', error);
          return of([]);
        })
      )
    .subscribe(data => {
      // If no suggestions, show "No such city"
      if (!data || data.length === 0) {
      } else {
        this.citySuggestions = data;  // Otherwise, populate with valid suggestions
      }
    });

  }

  selectDataOption(option: string) {
    this.selectedDataToShow = option;
    localStorage.setItem('dataToShow', option);
  }

  searchWeatherForCity(city: string) {
    const formattedCity = city.replace(/\s+/g, '_');
    const encodedCity = encodeURIComponent(formattedCity);
  
    this.weatherService.searchWeather(encodedCity).subscribe(
      (resp) => {
        if (resp && resp.forecast && resp.forecast.forecastday) {
          this.weather = resp;
          this.currentCity = city;
          this.forecast = resp.forecast.forecastday;
          this.updateCatGif();
          this.updateWeatherGif();
          this.updateWeatherIconGif();
        } else {
        }
      },
      (error) => {
      }
    );
  }
  

  searchWeather() {
    const city = this.searchForm.get('city')!.value;
    if (city) {
      this.searchWeatherForCity(city);
    }
  }



  updateCatGif() {
    const condition = this.weather.current.condition.text.toLowerCase();
    const rainyConditions = ['rain', 'drizzle', 'thunderstorm', 'shower', 'overcast'];
    this.isRainy = rainyConditions.some((rainCondition) => condition.includes(rainCondition));
    this.weatherCatGif = this.isRainy ? '../../assets/KeepSafe.gif' : '../../assets/HotDay.gif';
  }

  updateWeatherGif() {
    const condition = this.weather.current.condition.text.toLowerCase();
    const lRainyConditions = ['light rain', 'patchy rain', 'moderate rain', 'drizzle', 'shower', 'overcast'];
    const stormConditions = ['thunderstorm'];
    const sunnyConditions = ['sunny', 'clear'];
    const cloudyConditions = ['cloudy', 'partly cloudy'];

    if (lRainyConditions.some((rainCondition) => condition.includes(rainCondition))) {
      this.weatherGif = '../../assets/animated/rainy-7.svg';
    } else if (stormConditions.some((stormCondition) => condition.includes(stormCondition))) {
      this.weatherGif = '../../assets/animated/thunder.svg';
    } else if (sunnyConditions.some((sunnyCondition) => condition.includes(sunnyCondition))) {
      this.weatherGif = '../../assets/animated/day.svg';
    } else if (cloudyConditions.some((cloudyCondition) => condition.includes(cloudyCondition))) {
      this.weatherGif = '../../assets/animated/cloudy.svg';
    } else {
      this.weatherGif = '../../assets/animated/day.svg';
    }
  }

  updateWeatherIconGif() {
    this.forecast.forEach((day: any, index: number) => {
      const condition = day.day.condition.text.toLowerCase();
      const lRainyConditions = ['light rain', 'patchy rain', 'moderate rain', 'drizzle', 'shower', 'overcast'];
      const stormConditions = ['thunderstorm'];
      const sunnyConditions = ['sunny', 'clear'];
      const cloudyConditions = ['cloudy', 'partly cloudy'];

      if (lRainyConditions.some((rainCondition) => condition.includes(rainCondition))) {
        this.forecast[index].weatherIconGif = '../../assets/animated/rainy-7.svg';
      } else if (stormConditions.some((stormCondition) => condition.includes(stormCondition))) {
        this.forecast[index].weatherIconGif = '../../assets/animated/thunder.svg';
      } else if (sunnyConditions.some((sunnyCondition) => condition.includes(sunnyCondition))) {
        this.forecast[index].weatherIconGif = '../../assets/animated/day.svg';
      } else if (cloudyConditions.some((cloudyCondition) => condition.includes(cloudyCondition))) {
        this.forecast[index].weatherIconGif = '../../assets/animated/cloudy.svg';
      } else {
        this.forecast[index].weatherIconGif = '../../assets/animated/day.svg';
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: { unsubscribe: () => any }) => sub.unsubscribe());
    Object.keys(this.weatherService['cache']).forEach((city) => {
      this.weatherService['clearCache'](city);
    });
    localStorage.setItem('temperatureUnit', this.selectedTemperatureUnit);
  }

  setTemperatureUnit(unit: 'celsius' | 'fahrenheit'): void {
    this.selectedTemperatureUnit = unit;
    localStorage.setItem('temperatureUnit', unit);
  }

  onDataToShowChange() {
    localStorage.setItem('dataToShow', this.selectedDataToShow);
  }

  selectCity(suggestion: any) {
    this.selectedCity = suggestion.name;
    this.searchWeatherForCity(this.selectedCity);
    this.citySuggestions = []; // Clear suggestions after selection
    this.searchControl.setValue(''); // Reset the input field
  }
}
