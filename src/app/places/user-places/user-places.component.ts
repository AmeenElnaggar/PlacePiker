import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import type { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  private placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  userPlaces = this.placesService.loadedUserPlaces;
  error = signal('');
  isFetching = signal(false);

  ngOnInit() {
    this.isFetching.set(true);
    const subscribtion = this.placesService.loadUserPlaces().subscribe({
      error: (error: Error) => this.error.set(error.message),
      complete: () => this.isFetching.set(false),
    });
    this.destroyRef.onDestroy(() => subscribtion.unsubscribe());
  }

  onRemovePlace(selectedPlace: Place) {
    const subscribtion = this.placesService
      .removeUserPlace(selectedPlace)
      .subscribe({
        next: (deletedPlace) => console.log(deletedPlace),
      });
    this.destroyRef.onDestroy(() => {
      subscribtion.unsubscribe();
    });
  }
}
