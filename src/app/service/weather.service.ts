import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = 'http://localhost/weather-app/api/';
  private cache: { [city: string]: { data: any, expiration: number } } = {};
  private cacheDuration = 5 * 60 * 1000; // Cache duration in milliseconds (5 minutes)
  private apiKey = '6ebc215bec4b4d53823140857241607';

  constructor(private http: HttpClient) {}

  private formatCityName(city: string): string {
    return city.replace(/\s+/g, '_'); // Replace spaces with underscores
  }

  private formatCoords(latitude: number, longitude: number): string {
    return `${latitude}/${longitude}`;
  }

  fetchWeather(city: string): Observable<any> {
    const formattedCity = this.formatCityName(city);
    const url = `${this.baseUrl}weather/${formattedCity}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  searchWeather(city: string): Observable<any> {
    const formattedCity = this.formatCityName(city);

    // Check if the data is in cache and still valid
    const cachedData = this.cache[formattedCity];
    const now = Date.now();
    if (cachedData && cachedData.expiration > now) {
      return of(cachedData.data); // Return cached data as an Observable
    }

    const url = `${this.baseUrl}weather/${formattedCity}`;
    return this.http.get(url).pipe(
      tap(data => {
        // Cache the data with an expiration time
        this.cache[formattedCity] = {
          data: data,
          expiration: now + this.cacheDuration
        };
      }),
      catchError(this.handleError)
    );
  }

  searchWeatherByCoords(latitude: number, longitude: number): Observable<any> {
    console.log(`Searching weather by coords: ${latitude}, ${longitude}`);
    const formattedCoords = this.formatCoords(latitude, longitude);
    const url = `${this.baseUrl}weather-lat-lon/${formattedCoords}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  clearCache(city: string) {
    if (this.cache[city]) {
      delete this.cache[city];
    }
  }

  searchCity(query: string): Observable<any> {
    const url = `${this.baseUrl}/city-suggestions/${encodeURIComponent(query)}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
