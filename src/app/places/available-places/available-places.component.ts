import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import type { Place } from '../place.model';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  error = signal('');
  isFetching = signal(false);

  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);

  ngOnInit() {
    this.isFetching.set(true);
    const subscribtion = this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => this.places.set(places),
      error: (error: Error) => this.error.set(error.message),
      complete: () => this.isFetching.set(false),
    });
    this.destroyRef.onDestroy(() => subscribtion.unsubscribe());
  }

  onSelectedPlace(selectedPlace: Place) {
    const subscribtion = this.placesService
      .addPlaceToUserPlaces(selectedPlace)
      .subscribe({
        next: (res) => console.log(res),
      });
    this.destroyRef.onDestroy(() => subscribtion.unsubscribe());
  }
}
