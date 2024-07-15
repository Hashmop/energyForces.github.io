// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to fetch nearby charging stations
async function fetchNearbyChargingStations(lat, lon, radius = 5000) {
    const apiKey = 'c6380fba-c77d-4f8d-a289-39425c836fb3'; // Replace with your actual API key
    const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=${radius}&distanceunit=KM&maxresults=100&compact=true&verbose=false&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching charging stations:', error);
        return [];
    }
}

// Function to add charging station markers to the map
function addChargingStationMarkers(stations) {
    stations.forEach(station => {
        const marker = L.marker([station.AddressInfo.Latitude, station.AddressInfo.Longitude]).addTo(map);
        marker.bindPopup(`
            <b>${station.AddressInfo.Title}</b><br>
            ${station.AddressInfo.AddressLine1}<br>
            ${station.AddressInfo.Town}, ${station.AddressInfo.Postcode}<br>
            <button onclick="showRoute([${userLocation[0]}, ${userLocation[1]}], [${station.AddressInfo.Latitude}, ${station.AddressInfo.Longitude}])">Route to here</button>
        `);
    });
}

// Function to show route (using OSRM Demo server - replace with your preferred routing service)
function showRoute(start, end) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (window.routeLayer) {
                map.removeLayer(window.routeLayer);
            }
            window.routeLayer = L.geoJSON(data.routes[0].geometry).addTo(map);
            map.fitBounds(window.routeLayer.getBounds());
        })
        .catch(error => console.error('Error:', error));
}

let userLocation;

// Get user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function(position) {
        userLocation = [position.coords.latitude, position.coords.longitude];
        
        // Add a marker for the user's location
        L.marker(userLocation).addTo(map)
            .bindPopup("You are here")
            .openPopup();

        // Fetch and display nearby charging stations
        const stations = await fetchNearbyChargingStations(userLocation[0], userLocation[1]);
        addChargingStationMarkers(stations);

        // Center the map on the user's location
        map.setView(userLocation, 13);
    }, function(error) {
        console.error("Error getting user location:", error);
        alert("Unable to get your location. Please check your browser settings.");
    });
} else {
    console.log("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by your browser. Please enter your location manually.");
}

// Enable scrolling and zooming
map.scrollWheelZoom.enable();