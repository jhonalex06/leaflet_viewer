// Map
var latlngMap = [46.5455, -66.7362];

var mapOptions = {
    center: latlngMap,
    zoom: 8,
    zoomControl: true,
    measureControl: true
}

var map = L.map('mapdiv',mapOptions);
var defaultBase = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

// Layers
var ongrights = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [2],
    useCors: false
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
    useCors: true
})
.addTo(map);

// //Layer switch control
// var baseLayers = {
//     'Open Street Map': L.tileLayer.provider('OpenStreetMap'),
//     'USGS TNM': L.tileLayer.provider('USGSTNM'),
//     'ESRI Imagery': L.tileLayer.provider('Esri.WorldImagery'),
//     'ESRI Ocean Basemap': L.tileLayer.provider('Esri.OceanBasemap'),
//     'OSM Topo': L.tileLayer.provider('OpenTopoMap')
// };

// // //Overlay grouped layers    
// var groupOverLays = {
//     "Layers": {
//         "ONG Rights": ongrights,
//         "Utility": utility,
//         "Seafood": seafood
//     }
// };

// L.control.groupedLayers(baseLayers, groupOverLays).addTo(map);

var baseLayer = [
	{
		group: "Base Map",
		collapsed: true,
		layers: [
            {
                name: "Open Street Map",
                layer: L.tileLayer.provider('OpenStreetMap')
            },
            {
                name: "USGS TNM",
                layer: L.tileLayer.provider('USGSTNM')
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
                // icon: '<img width="20" height="20" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAASFJREFUOI3t1LEvQ0EcwPHvr6ovMbUGUV0kFlaWhtlma7SV1NShsfhLOhArE8N78hgkSCwmMeo/wNY+LB31NH0/Sxfx2jtikfgmN93lc7/hcml+ufQ/+KljnrMZ4g31WBRkgIlb7/Svt5nvfRsM6NQhbgJZMQAKCBm8tk/UqJK/dAZ9ol3Q/eSrtCBwEdDZrDB3bgV9ogVBm6MmH5YCDk95vS0z0x0LiqcNDJMWECCnDGrAwVgQQ9EBG6ZFOwhT7uDXswmgPIKuOHEeTxgLqBAKlN0G1NA6YZXZMCC6A9YsWlAxhXsrCKIx7VIKuQKWR2A3PSbqSRuJD3uLwssZ3dU+bzsCNWAJGAAPwNE0+ZN1JHYGAUrkDLA3XM798e/rJ30AVWZPq/J7JFcAAAAASUVORK5CYII=">',
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
	collapsibleGroups: true
}).addTo(map);

// Scale bar
L.control.scale({
    position: 'bottomleft'
}).addTo(map);

// BaseMap Minimap
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

// Overview mini map
var miniMap = new L.Control.MiniMap(osm, {
    toggleDisplay: true,
    minimized: false,
    position: 'bottomright'
}).addTo(map);

// Drawing toolbar options
var options = {
    position: 'topright', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    drawMarker: true, // adds button to draw markers
    drawPolyline: true, // adds button to draw a polyline
    drawRectangle: true, // adds button to draw a rectangle
    drawPolygon: true, // adds button to draw a polygon
    drawCircle: true, // adds button to draw a cricle
    cutPolygon: true, // adds button to cut a hole in a polygon
    editMode: true, // adds button to toggle edit mode for all layers
    removalMode: true, // adds a button to remove layers
};

// Add leaflet.pm controls to the map
map.pm.addControls(options);

// Legend
L.esri.legendControl(seafood, { position: "topleft" }).addTo(map);

// Query (Find by Tenure ID)
var queryString = window.location.search;

queryString = queryString.substring(1);

if (queryString && queryString !== 'MapSelection'){
    ongrights.query().layer(2).where(`TENURE_NUMBER_ID = '${queryString}'`).bounds(function (error, latLngBounds, response) {
        if (error) {
        console.log(error);
        console.log(latLngBounds)
        return;
        }
        map.fitBounds(latLngBounds);
    });

// M00021679
// M00021677
// M00021658
// M00015995
}


// Map Selection
if (queryString && queryString === 'MapSelection'){
    grid.on('click', function(e){
        if (e.layer.feature.properties.selected === true) {
            grid.resetFeatureStyle(e.layer.feature.id);
            e.layer.feature.properties.selected = false
        }
        else{
            e.layer.feature.properties.selected = true
            e.layer.bringToFront();
            grid.setFeatureStyle(e.layer.feature.id, {
                color: '#1DDADA',
                weight: 3,
                opacity: 1
            });
        }
      })

    const Map_AddLayer = {
        'Layer': grid,
    };

    L.control.MapSelection(Map_AddLayer, { position: 'bottomright'}).addTo(map);
}