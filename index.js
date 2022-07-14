var map = L.map('mapdiv',{
    center: [46.5455, -66.7362],
    zoom: 8
});

var osm=new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

var layers = L.esri.dynamicMapLayer({
    url: "https://humpback1:6443/arcgis/rest/services/AlternativeGCX/Test/MapServer/",
    layers: [0],
    useCors: false
})
.addTo(map);

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

console.log(layers);

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
    ongrights.query().layer(2).where(`TENURE_NUMBER_ID = '${queryString}'`).bounds(function (error, latLngBounds, response) {
        if (error) {
        console.log(error);
        console.log(latLngBounds)
        return;
        }
        map.fitBounds(latLngBounds);
    });
}