/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2Ztb3ZlIiwiYSI6ImNrbGJwZzZ2bTE4NWUybmxieHV5bDI2ZGoifQ.dBSiA-QErkEyqEKU2idnfg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/sfmove/cklgkbz6j111j17mosl90d8vf',
        scrollZoom: false,
        // center: [-118.113491, 34.111745],
        // zoom: 5,
        // interactive: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Create marker on the map
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            // anchor, is a point that will be at exact location on the map, in this case icons bottom
            anchor: 'bottom',
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup with location info
        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current locations
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};
