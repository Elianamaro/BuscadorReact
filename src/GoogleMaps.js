import React, { useEffect, useRef } from 'react';
import './GoogleMaps.css';

const GoogleMaps = ({ lugares }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDw5jHHfPvqZM8ErtgrM_19QiPvFRhwHiA&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    };

    if (!window.google) {
      loadScript();
    } else {
      initMap();
    }

    function initMap() {
      mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      updateMarkers();
    }

    function updateMarkers() {
      if (!mapRef.current) return;

      // Clear old markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      lugares.forEach(lugar => {
        if (lugar.lat && lugar.lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: lugar.lat, lng: lugar.lng },
            map: mapRef.current,
            title: lugar.nombre,
          });
          markersRef.current.push(marker);
          bounds.extend(marker.getPosition());

          marker.addListener('click', () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div>
                  <h3>${lugar.nombre}</h3>
                  <p>Latitud: ${lugar.lat}</p>
                  <p>Longitud: ${lugar.lng}</p>
                  <p>${lugar.descripcion}</p>
                  <p><button className="button">Ver detalle</button></p>
                </div>
              `,
            });

            infoWindow.open(mapRef.current, marker);
            infoWindowRef.current = infoWindow;
          });
        }
      });

      if (lugares.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    }

    updateMarkers();
  }, [lugares]);

  return <div id="map" style={{ height: '100vh', width: '100vw' }}></div>;
};

export default GoogleMaps;
