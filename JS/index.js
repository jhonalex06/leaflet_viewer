//Map
var latlngMap = [46.5455, -66.7362];

var mapOptions = {
    center: latlngMap,
    zoom: 8,
    zoomControl: true,
    measureControl: true
}

var map = L.map('mapdiv',mapOptions);

//BaseMap
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
var defaultBase = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

var baseLayers = {
    'Open Street Map': defaultBase,
    'USGS TNM': L.tileLayer.provider('USGSTNM'),
    'ESRI Imagery': L.tileLayer.provider('Esri.WorldImagery'),
    'ESRI Ocean Basemap': L.tileLayer.provider('Esri.OceanBasemap'),
    'OSM Topo': L.tileLayer.provider('OpenTopoMap')
};

// var osm=new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

//Layers
var seafood = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [0],
    useCors: false
})
.addTo(map);

var utility = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [1],
    useCors: false
})
.addTo(map);

var ongrights = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [2],
    useCors: false
})
.addTo(map);

//Query
var queryString = window.location.search;

queryString = queryString.substring(1);

if (queryString){
    ongrights.query().layer(2).where(`TENURE_NUMBER_ID = '${queryString}'`).bounds(function (error, latLngBounds, response) {
        if (error) {
        console.log(error);
        console.log(latLngBounds)
        return;
        }
        map.fitBounds(latLngBounds);
    });
}

//Overlay grouped layers    
var groupOverLays = {
    "Layers": {
        "Seafood": seafood,
        "Utility": utility,
        "ONG Rights": ongrights
    }
};

//add layer switch control
L.control.groupedLayers(baseLayers, groupOverLays).addTo(map);

//add scale bar to map
L.control.scale({
    position: 'bottomleft'
}).addTo(map);

// Overview mini map
var miniMap = new L.Control.MiniMap(osm, {
    toggleDisplay: true,
    minimized: false,
    position: 'bottomright'
}).addTo(map);

//define Drawing toolbar options
var options = {
    position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    drawMarker: true, // adds button to draw markers
    drawPolyline: true, // adds button to draw a polyline
    drawRectangle: true, // adds button to draw a rectangle
    drawPolygon: true, // adds button to draw a polygon
    drawCircle: true, // adds button to draw a cricle
    cutPolygon: true, // adds button to cut a hole in a polygon
    editMode: true, // adds button to toggle edit mode for all layers
    removalMode: true, // adds a button to remove layers
};

// add leaflet.pm controls to the map
map.pm.addControls(options);