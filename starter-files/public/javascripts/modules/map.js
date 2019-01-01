/*global google*/
import { DEFAULT_LOCATION, DEFAULT_ZOOM, DEFAULT_PHOTO } from '../constant';
import { $ } from './bling';
import axios from 'axios';

export default (mapId) => {
  const map = new google.maps.Map(document.getElementById(mapId), {
    center: DEFAULT_LOCATION,
    zoom: DEFAULT_ZOOM
  });
  const infoWindow = createInfoWindow();
  const suggestLocation = new google.maps.places.Autocomplete($('#suggest_location'));

  suggestLocation.addListener('place_changed', () => {
    const place = suggestLocation.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    loadNearShop(map, {lat, lng}, infoWindow);
  });

  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude: lat, longitude: lng } = pos.coords; 

    map.setCenter({lat, lng});
    loadNearShop(map, {lat, lng}, infoWindow);
  });

};

async function loadNearShop(map, location = {lat: 10.7507369, lng: 106.7057847}, infoWindow) {
  const { lat, lng } = location;
  const { data } = await axios.get(`/mapStores?lat=${lat}&lng=${lng}`);
  const bounds = new google.maps.LatLngBounds();
  if(!data.length) return;

  data.forEach((shop) => {
    const {description, name, photo} = shop;
    const [lng, lat] = shop.location.coordinates;
    const marker = new google.maps.Marker({
      position: {lat, lng}, 
      map,
      title: shop.name
    });
    bounds.extend({lat, lng});

    marker.addListener('click', () => {
      setContentInfoWindow(infoWindow, name, description, photo);
      infoWindow.open(map, marker);
    });
  });

  map.setCenter(bounds.getCenter());
  map.fitBounds(bounds);
}

function createInfoWindow() {
  let contentString = '<div id="content"></div>';

  let infoWindow = new google.maps.InfoWindow({
    content: contentString
  });

  return infoWindow;
}

function setContentInfoWindow(infoWindow, name ='', description = '', photo = DEFAULT_PHOTO) {
  const content = `<div id="content">
    <h3>${name}</h3>
    <p>${description}</p>
    <image src="/uploads/${photo}" style="max-width: 300px"/>
  </div>`;
  infoWindow.setContent(content);
}

