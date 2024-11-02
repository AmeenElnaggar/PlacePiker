import { inject, Injectable, signal } from '@angular/core';
import { map, catchError, throwError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ErrorService } from '../shared/error.service';
import type { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'placepiker.railway.internal',
      'Something went wrong fetching the avaliable places. please try again later.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong fetching your favorite places. please try again later.'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(selectedPlace: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((place) => place.id === selectedPlace.id)) {
      this.userPlaces.set([...prevPlaces, selectedPlace]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: selectedPlace.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to store selected place');
          return throwError(() => new Error('Failed to store selected place'));
        })
      );
  }

  removeUserPlace(selectedPlace: Place) {
    const prevPlaces = this.userPlaces();

    if (prevPlaces.some((place) => selectedPlace.id === place.id)) {
      this.userPlaces.set(
        prevPlaces.filter((place) => place.id !== selectedPlace.id)
      );
    }

    return this.httpClient
      .delete(`http://localhost:3000/user-places/${selectedPlace.id}`)
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to remove the selected place');
          return throwError(
            () => new Error('Failed to remove the selected place')
          );
        })
      );
  }

  private fetchPlaces(url: string, errorMsg: string) {
    return this.httpClient.get<{ places: Place[] }>(`${url}`).pipe(
      map((response) => response.places),
      catchError((error) => throwError(() => new Error(`${errorMsg}`)))
    );
  }
}
