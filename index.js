var map = L.map('mapdiv',{
    center: [46.5455, -66.7362],
    zoom: 8
});
var osm=new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

var rights = L.esri.featureLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/2"
})
.addTo(map);

var utilities = L.esri
    .featureLayer({
        url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/1"
    })
    .addTo(map);

var seafood = L.esri
    .featureLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/0",
    pointToLayer: function (geojson, latlng) {
        // return L.circleMarker(latlng, geojsonMarkerOptions);
        return L.circleMarker(latlng);
    }
    })
    .addTo(map);

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
