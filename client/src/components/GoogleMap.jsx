import React, { useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';

const PoiMarkers = ({ pois }) => (
  <>
    {pois.map((poi) => (
      <AdvancedMarker
        key={poi.key}
        position={poi.location}
      >
        <Pin background={'#e76b45'} glyphColor={'#000'} borderColor={'#000'} />
      </AdvancedMarker>
    ))}
  </>
);

const GoogleMapComponent = ({locations}) => {
  console.log("locations in google comp", locations)
  if (!locations.length) return <div>No locations to display.</div>;

  // Center the map on the first location
  const defaultCenter = locations[0].location;

  return (
    <APIProvider apiKey="">
      <Map
        style={{ width: '100%', height: '400px' }}
        defaultCenter={defaultCenter}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapId='55fd06d7e813f5418a96ec14'
      >

        <PoiMarkers pois={locations} />
      </Map>
    </APIProvider>
  );
};

export default GoogleMapComponent;
