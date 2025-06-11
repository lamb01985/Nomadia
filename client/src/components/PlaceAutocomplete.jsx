import React, { useEffect, useRef } from "react";

export default function PlaceAutocomplete({ onSelect }) {
  const inputRef = useRef();

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"], // or "establishment"

      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.place_id || !place.geometry) return;

      onSelect({
        name: place.name,
        address: place.formatted_address,
        placeId: place.place_id,
        location: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
      });
    });
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Destinations"
      className="border p-2 w-full"
    />
  );
}
