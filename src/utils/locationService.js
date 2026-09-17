// Geolocation tracking & Metro Manila nearest branch locator service

const LOCATION_KEY = 'lablab_user_gps_location_v1';
const PERMISSION_KEY = 'lablab_gps_permission_v1';

// Metro Manila Reference Districts for approximate friendly naming
const MANILA_DISTRICTS = [
  { name: 'BGC & Taguig', lat: 14.5510, lng: 121.0503 },
  { name: 'Makati (Ayala & Salcedo)', lat: 14.5547, lng: 121.0244 },
  { name: 'Ortigas & Megamall', lat: 14.5842, lng: 121.0568 },
  { name: 'Quezon City (Tomas Morato / QC Circle)', lat: 14.6366, lng: 121.0355 },
  { name: 'Katipunan & Eastwood', lat: 14.6402, lng: 121.0755 },
  { name: 'SM Mall of Asia & Pasay', lat: 14.5352, lng: 120.9822 },
  { name: 'Binondo & Manila City', lat: 14.6000, lng: 120.9750 },
  { name: 'Alabang & South Metro', lat: 14.4258, lng: 121.0315 }
];

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getNearestDistrictName(lat, lng) {
  let closest = MANILA_DISTRICTS[0];
  let minDistance = Infinity;

  MANILA_DISTRICTS.forEach(d => {
    const dist = calculateDistanceKm(lat, lng, d.lat, d.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  });

  return `${closest.name} (~${minDistance.toFixed(1)} km away)`;
}

export function getStoredLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredPermission() {
  try {
    return localStorage.getItem(PERMISSION_KEY) || 'prompt'; // 'prompt', 'granted', 'denied'
  } catch {
    return 'prompt';
  }
}

export function setStoredPermission(status) {
  try {
    localStorage.setItem(PERMISSION_KEY, status);
  } catch (e) {
    console.warn(e);
  }
}

export function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          district: getNearestDistrictName(pos.coords.latitude, pos.coords.longitude),
          timestamp: Date.now()
        };
        try {
          localStorage.setItem(LOCATION_KEY, JSON.stringify(coords));
          localStorage.setItem(PERMISSION_KEY, 'granted');
        } catch (e) {}
        resolve(coords);
      },
      (err) => {
        setStoredPermission('denied');
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}
