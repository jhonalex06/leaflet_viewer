import { selectionEventHandler } from './selectionHandler.js';

// Map
var latlngMap = [46.5455, -66.7362];

var mapOptions = {
    fullscreenControl: true,
    measureControl: false,
    zoomsliderControl: true,
    zoomControl: false,
    pmIgnore: false
}

var map = L.map('mapdiv',mapOptions).setView(latlngMap, 8);
var defaultBase = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

// Layers
var ongrights = L.esri.featureLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/2",
    useCors: true,
})
.addTo(map);

var utility = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [1],
    useCors: false
})
.addTo(map);

var seafood = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [0],
    useCors: false
})
.addTo(map);

var grid = L.esri.featureLayer({
    url: "http://cat2:6080/arcgis/rest/services/LTStest/LTS_BaseMaps/MapServer/5",
    // minZoom: 14,
    useCors: true
})
.addTo(map);

var baseLayer = [
	{
		group: "Base Map",
		collapsed: true,
		layers: [
            {
                name: "Open Street Map",
                layer: defaultBase
                // layer: L.tileLayer.provider('OpenStreetMap')
            },
            {
                name: "ESRI Imagery",
                layer: L.tileLayer.provider('Esri.WorldImagery')
            },{
                name: "ESRI Ocean Basemap",
                layer: L.tileLayer.provider('Esri.OceanBasemap')
            },{
                name: "OSM Topo",
                layer: L.tileLayer.provider('OpenTopoMap')
            }
		]
	}
];

var overLayers = [
	{
		group: "Layers",
		layers: [
            {
				active: true,
				name: "Seafood",
                layer: seafood
			},
			{
				active: true,
				name: "Utility",
				layer: utility
			},
            {
				active: true,
				name: "ONG Rights",
				layer: ongrights
			},
            {
				active: true,
				name: "Grid",
				layer: grid
			}
		]
    }];

var panelLayers = new L.Control.PanelLayers(baseLayer, overLayers, {
	compact: true,
	// collapsed: true,
	collapsibleGroups: true,
    position:'topright'
}).addTo(map);

// Scale bar
L.control.scale({
    position: 'bottomleft',
    updateWhenIdle: true
}).addTo(map);

// Overview mini map
var miniMap = new L.Control.MiniMap(L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'), {
    toggleDisplay: true
}).addTo(map);

// Drawing toolbar options
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
    dragMode: true,
    oneBlock: false,
    customControls: true
};

// Add leaflet.pm controls to the map
map.pm.addControls(options);

//Block dragMode in all layers
L.PM.setOptIn(false);

//Allow toolbar options just after event
map.on('pm:create', (e) => {
    ongrights.setStyle({ pmIgnore: true });
    grid.setStyle({ pmIgnore: true });
    L.PM.reInitLayer(e.layer);    
  });
  
var browserControl = L.control.browserPrint({printModes: ["Portrait", "Landscape", "Auto"], documentTitle:'PGTS-Viewer'}).addTo(map);

// Legend
L.esri.legendControl(seafood, { position: 'topright' }).addTo(map);

const provider = new GeoSearch.OpenStreetMapProvider();

const searchControl = new GeoSearch.GeoSearchControl({
    provider: provider,
    style: 'bar',
    position: 'topright'
});

map.addControl(searchControl);

// Query (Find by Tenure ID)
var queryString = window.location.search;

queryString = queryString.substring(1);

if (queryString && queryString !== 'MapSelection'){

    ongrights.query().where(`TENURE_NUMBER_ID = '${queryString}'`).bounds(function (error, latLngBounds, response) {
        if (error) {
        console.log(error);
        console.log(latLngBounds)
        return;
        }
        map.fitBounds(latLngBounds);
    });

    ongrights.on('load', function (e) {
        ongrights.query().where(`TENURE_NUMBER_ID = '${queryString}'`).ids(function (error, ids) {
            // if there is an error with the query, you can handle it here
            if (error) {
              console.log('Error with query: ' + error);
            } else if (ids) {
              previousIds = ids;
              for (var i = ids.length - 1; i >= 0; i--) {
                ongrights.setFeatureStyle(ids[i], {
                    color: '#1DDADA',
                    weight: 3,
                    opacity: 1
                });
              }
            }});
    });

// M00021679
// M00021677
// M00021658
// M00015995
}


// Map Selection
if (queryString && queryString === 'MapSelection'){

    const Map_AddLayer = {
        'Layer': grid,
    };

    L.control.MapSelection(Map_AddLayer, { position: 'bottomright'}).addTo(map);

    const lassoControl = L.control.lasso({position: 'bottomright', title: 'Lasso'}).addTo(map);
    lassoControl.setOptions({ intersect: true });

    selectionEventHandler(map, grid);
}