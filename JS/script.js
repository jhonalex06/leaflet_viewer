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
var defaultBase = L.tileLayer.provider('USGSTNM').addTo(map);

var baseLayers = {
    'USGS TNM': defaultBase,
    'ESRI Imagery': L.tileLayer.provider('Esri.WorldImagery'),
    'ESRI Ocean Basemap': L.tileLayer.provider('Esri.OceanBasemap'),
    'OSM Topo': L.tileLayer.provider('OpenTopoMap')
};

// var osm=new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

//Layers
var rights = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [0,1,2],
    useCors: false
})
.addTo(map);

//Query
// var query = rights.setWhere("TENURE_NUMBER_ID = 'M00021679'")

// var fc = rights.query()
// .where("TENURE_NUMBER_ID = 'M00021679'")
// .run(function(error, featureCollection){
//     console.log(featureCollection);
// });

var queryString = window.location.search;

queryString = queryString.substring(1);
// var coords = queryString.split(",");
// map.fitBounds([[coords[0],coords[1]],[coords[2],coords[3]]]); //London

if (queryString){
    rights.query().where(`TENURE_NUMBER_ID = '${queryString}'`).bounds(function (error, latLngBounds, response) {
        if (error) {
        console.log(error);
        return;
        }
        map.fitBounds(latLngBounds);
    });
}

//Overlay grouped layers    
var groupOverLays = {
    "Layers": {
        "ONG Rights": rights
    }
};

//add layer switch control
L.control.groupedLayers(baseLayers, groupOverLays).addTo(map);

//add scale bar to map
L.control.scale({
    position: 'bottomleft'
}).addTo(map);

// Overview mini map
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

// var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
//     attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
// });

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