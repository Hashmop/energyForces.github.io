let map;
let currentMarkers = [];
let userLocation = [51.505, -0.09];
let activeFilters = new Set(['fast', 'ultra']);
let searchTimeout;

const chargerIcons = {
    fast: L.icon({
        iconUrl: 'images/fast-charger.png',
        iconSize: [34, 34],
        iconAnchor: [17, 34]
    }),
    ultra: L.icon({
        iconUrl: 'images/ultra-charger.png',
        iconSize: [42, 42],
        iconAnchor: [21, 42]
    })
};

function initMap() {
    map = L.map('map', {
        center: userLocation,
        zoom: 13,
        fullscreenControl: true,
        zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            addUserLocationMarker();
            loadChargers();
        }, handleLocationError);
    } else {
        loadChargers();
    }

    document.getElementById('location-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchLocation, 500);
    });
}

async function loadChargers() {
    try {
        showLoading(true);
        const stations = await fetchNearbyChargingStations(userLocation[0], userLocation[1]);
        window.lastStationData = stations;
        updateMapMarkers(stations);
        map.setView(userLocation, 13);
    } catch (error) {
        alert('Failed to load charging stations. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function fetchNearbyChargingStations(lat, lon) {
    const apiKey = 'c6380fba-c77d-4f8d-a289-39425c836fb3';
    const response = await fetch(`https://api.openchargemap.io/v3/poi/?latitude=${lat}&longitude=${lon}&distance=50&maxresults=50&key=${apiKey}`);
    const data = await response.json();
    return data.map(station => ({
        ...station,
        status: Math.random() > 0.1 ? 'available' : 'in-use',
        type: Math.random() > 0.5 ? 'fast' : 'ultra'
    }));
}

function updateMapMarkers(stations) {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];

    stations.forEach(station => {
        if (!activeFilters.has(station.type)) return;

        const marker = L.marker(
            [station.AddressInfo.Latitude, station.AddressInfo.Longitude],
            { icon: chargerIcons[station.type] }
        ).addTo(map);

        const popupContent = `
            <div class="charging-popup">
                <h4>${station.AddressInfo.Title}</h4>
                <div class="charging-status ${station.status}">
                    <i class="fas fa-${station.status === 'available' ? 'check-circle' : 'exclamation-triangle'}"></i>
                    ${station.status.toUpperCase()}
                </div>
                <div class="popup-details">
                    <p><i class="fas fa-charging-station"></i> ${station.type.charAt(0).toUpperCase() + station.type.slice(1)} Charger</p>
                    <p><i class="fas fa-tachometer-alt"></i> ${station.type === 'ultra' ? '350kW' : '150kW'} Power</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${(station.AddressInfo.Distance * 1.60934).toFixed(1)} km away</p>
                    ${station.status !== 'available' ? `
                    <p><i class="fas fa-clock"></i> Estimated wait: 10-15 mins</p>
                    ` : ''}
                </div>
                <div class="popup-actions">
                    <button class="animated-button" onclick="showRoute([${userLocation}], [${station.AddressInfo.Latitude}, ${station.AddressInfo.Longitude}])">
                        <i class="fas fa-route"></i> Directions
                    </button>
                    <button class="animated-button" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${station.AddressInfo.Latitude},${station.AddressInfo.Longitude}')">
                        <i class="fas fa-external-link-alt"></i> Open Maps
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        currentMarkers.push(marker);
    });
}

function addUserLocationMarker() {
    L.marker(userLocation, {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse-dot"></div>',
            iconSize: [20, 20]
        })
    }).addTo(map).bindPopup("Your Location");
}

function showLoading(show) {
    document.querySelector('.loading-overlay').style.display = show ? 'flex' : 'none';
}

function handleLocationError(error) {
    console.error("Geolocation error:", error);
    loadChargers();
}

window.showRoute = function(start, end) {
    showLoading(true);
    fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`)
        .then(response => response.json())
        .then(data => {
            if (window.routeLayer) map.removeLayer(window.routeLayer);
            window.routeLayer = L.geoJSON(data.routes[0].geometry).addTo(map);
            map.fitBounds(window.routeLayer.getBounds());
        })
        .finally(() => showLoading(false));
}

window.toggleFilter = function(type) {
    const btn = document.getElementById(`${type}-filter`);
    btn.classList.toggle('active');
    activeFilters.has(type) ? activeFilters.delete(type) : activeFilters.add(type);
    updateMapMarkers(window.lastStationData);
}

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            map.setView(userLocation, 13);
            loadChargers();
        }, handleLocationError);
    }
}

async function searchLocation() {
    const query = document.getElementById('location-search').value;
    if (!query) return;

    try {
        showLoading(true);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`);
        const results = await response.json();
        if (results.length > 0) {
            userLocation = [results[0].lat, results[0].lon];
            map.setView(userLocation, 13);
            loadChargers();
        }
    } finally {
        showLoading(false);
    }
}

document.addEventListener('DOMContentLoaded', initMap);