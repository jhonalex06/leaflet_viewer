import { selectionEventHandler } from './selectionHandler.js';
import * as generalConfig from './generalConfig.js'

// Map
const zoomMap = 8;
const latMap = 46.5455;
const lngMap = -66.7362;

var mapOptions = {
    fullscreenControl: true,
    measureControl: false,
    zoomsliderControl: true,
    zoomControl: false,
    pmIgnore: false,
    minZoom: 3,
    maxZoom: 15,
    measureControl: true,
    contextmenu: true,
    contextmenuWidth: 140,
	contextmenuItems: [{
	    text: 'Show coordinates',
	    callback: showCoordinates
	}, {
	    text: 'Center map here',
	    callback: centerMap
	}, '-', {
	    text: 'Zoom in',
	    // icon: 'images/zoom-in.png',
	    callback: zoomIn
	}, {
	    text: 'Zoom out',
	    // icon: 'images/zoom-out.png',
	    callback: zoomOut
	}]
}

var map = L.map('mapdiv',mapOptions).setView([latMap, lngMap], zoomMap);
var defaultBase = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

L.control.MapMeasure().addTo(map);

//Locate control
map.addControl(L.control.locate({
    locateOptions: {
            enableHighAccuracy: true
    },
    strings: {
        title: "Your Location"
    }
}));

//CRS Control
var crsinfo = L.Control.extend({

    options: {position: "bottomleft"},
    onAdd: function(map) {    
        var className = 'pgts-mapselection';    
        var container = L.DomUtil.create('div', 'crsinfo');
        var select = leaflet.DomUtil.create('select', className, container);
        var option1 = leaflet.DomUtil.create('option', className, select);
        var option2 = leaflet.DomUtil.create('option', className, select);

        option1.innerHTML = "EPSG1";
        option2.innerHTML = "EPSG2";
        L.DomEvent.on( select, 'change', this.onSet, this);
        return container;
    },
    
    onSet: function() {
        console.log(map.options.crs.code);
    }
});

map.addControl(new crsinfo());

// const currentCRS = L.Control.extend({
//     options: {
//       position: "bottomleft",
//     },
  
//     onAdd: function (map) {

//       const currentCRS = L.DomUtil.create("p");
//       currentCRS.title = "EPSG";
//       currentCRS.innerHTML = map.options.crs.code;
  
//       return currentCRS;
//     },
// });

// map.addControl(new currentCRS());

//Zoom Home 
const htmlTemplate =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';

// create custom button
const zoomHome = L.Control.extend({
    // button position
    options: {
      position: "topleft",
    },
  
    // method
    onAdd: function (map) {
      // create button
      const btn = L.DomUtil.create("button");
      btn.title = "Initial View";
      btn.innerHTML = htmlTemplate;
      btn.className += "leaflet-bar back-to-home hidden";
  
      return btn;
    },
});

// adding new button to map control
map.addControl(new zoomHome());

// on drag end
map.on("moveend", getCenterOfMap);

const buttonBackToHome = document.querySelector(".back-to-home");

function getCenterOfMap() {
    buttonBackToHome.classList.remove("hidden");

    buttonBackToHome.addEventListener("click", () => {
        map.flyTo([latMap, lngMap], zoomMap);
    });

    map.on("moveend", () => {
        const { lat: latCenter, lng: lngCenter } = map.getCenter();

        const latC = latCenter.toFixed(3) * 1;
        const lngC = lngCenter.toFixed(3) * 1;

        const defaultCoordinate = [+latMap.toFixed(3), +lngMap.toFixed(3)];

        const centerCoordinate = [latC, lngC];

        if (compareToArrays(centerCoordinate, defaultCoordinate)) {
        buttonBackToHome.classList.add("hidden");
        }
    });
}

const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);

//Context menu
function showCoordinates (e) {
	console.log(e.latlng);
}

function centerMap (e) {
	map.panTo(e.latlng);
}

function zoomIn (e) {
	map.zoomIn();
}

function zoomOut (e) {
	map.zoomOut();
}

function LoadUrl(layersArray){
    
    var layersLegend = []

    for (var layers of layersArray){
        const url = Object.keys(layers)[0]

        for (var list of layers[url]){
            var layerLoaded = L.esri.dynamicMapLayer({
                url: url,
                layers: [list['id']],
                minZoom: list['minZoom'],
                useCors: false
            })
            .addTo(map);
    
            layersLegend.push({
                active: list['active'],
                name: list['name'],
                layer: layerLoaded,
            });
        }
    }

    return layersLegend
}

// Layers
var layersLegend = LoadUrl(generalConfig.layers_lts_tenure['layers']);

var Sections = L.esri.featureLayer({
    url: "http://cat2:6080/arcgis/rest/services/LTStest/LTS_Tenure_Op/MapServer/191",
    minZoom: 14,
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
		group: "Minerals and Resource Development",
		layers: layersLegend
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
    // Sections.setStyle({ pmIgnore: true });
    L.PM.reInitLayer(e.layer);    
  });

//Print  
var browserControl = L.control.browserPrint({printModes: ["Portrait", "Landscape", "Auto"], documentTitle:'PGTS-Viewer', title:"Print Map"}).addTo(map);

// Legend
// L.esri.legendControl(seafood, { position: 'topright' }).addTo(map);

//Search location
const provider = new GeoSearch.OpenStreetMapProvider();

const searchControl = new GeoSearch.GeoSearchControl({
    provider: provider,
    style: 'bar',
    position: 'topright'
});

map.addControl(searchControl);

//Control Placeholders
(function addControlPlaceholders(map) {
    let corners = map._controlCorners;
    let l = "leaflet-";
    let container = map._controlContainer;
  
    function createCorner(vSide, hSide) {
      let className = l + vSide + " " + l + hSide;
      corners[vSide + hSide] = L.DomUtil.create("div", className, container);
    }
  
    createCorner("top", "center");
    createCorner("bottom", "center");
    createCorner("vertical", "left");
    createCorner("vertical", "right");
  })(map);
  
  // --------------------------------------------------------------
  const configs = [
    // { position: "topcenter", description: "top description" },
    { position: "bottomcenter", description: map.options.crs.code },
    // { position: "verticalleft", description: "left description" },
    // { position: "verticalright", description: "right description" },
  ];
  
  configs.forEach((item) => {
    L.Control.Search = L.Control.extend({
      options: {
        position: item.position,
      },
      onAdd: function () {
        const container = L.DomUtil.create("div", "description");
  
        L.DomEvent.disableClickPropagation(container);
  
        container.insertAdjacentHTML("beforeend", item.description);
  
        return container;
      },
    });
  
    new L.Control.Search().addTo(map);
  });

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
        'Layer': Sections,
    };

    L.control.MapSelection(Map_AddLayer, { position: 'bottomright'}).addTo(map);

    const lassoControl = L.control.lasso({position: 'bottomright', title: 'Lasso'}).addTo(map);
    lassoControl.setOptions({ intersect: true });

    selectionEventHandler(map, Sections);
}

