import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useTrip } from '../utils/TripContext';
import { useAuth } from '../utils/auth';

export type Destination = {
  id: string
  name: string
  country: string
  photoUrl?: string
}

type DestinationCardProps = {
  destination: Destination
  onAdd?: (destination: Destination) => void
  isAdded?: boolean
}

export default function DestinationCard({ destination, onAdd, isAdded }: DestinationCardProps) {
  const { addCity, selectedCities } = useTrip();
  const { isAuthenticated } = useAuth();

  const handleAddToTrip = () => {
    if (!isAuthenticated) {
      // Show login prompt or redirect
      alert('Please log in to add destinations to your trip');
      return;
    }

    // Add to trip context
    addCity({
      id: destination.id,
      name: destination.name,
      country: destination.country,
      img: destination.photoUrl || ''
    });

    // Call parent onAdd if provided
    if (onAdd) {
      onAdd(destination);
    }
  };

  // Check if this destination is already in the trip
  const isInTrip = selectedCities.some(city => city.id === destination.id);

  return (
    <article className="group inline-block w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 w-full bg-neutral-100">
        {destination.photoUrl ? (
          <img src={destination.photoUrl} alt={`${destination.name} photo`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900">{destination.name}</h3>
            <p className="text-xs text-neutral-600">{destination.country}</p>
          </div>
          <button
            onClick={handleAddToTrip}
            disabled={isInTrip}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium shadow-sm transition-colors ${
              isInTrip 
                ? 'bg-emerald-600 text-white cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isInTrip ? (
              <>
                <Check className="h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Add to Trip
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}


