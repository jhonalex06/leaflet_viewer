L.Control.MapSelection = L.Control.extend({

    options: {
		minZoom: 3,
		maxZoom: 23
	},

    initialize: function(overlays, options) {
        L.setOptions(this, options);
        this._layers = [];
        for (const i in overlays) {
            this._addLayer(overlays[i], i, true);
        }
    },

    onAdd: function(map) {
        var container = leaflet.DomUtil.create('div', 'leaflet-bar');
        var container2 = leaflet.DomUtil.create('div', 'leaflet-bar');
        var container3 = leaflet.DomUtil.create('div', 'leaflet-bar');
        var className = 'pgts-mapselection';
        var btn = leaflet.DomUtil.create('button', className, container);
        var btn2 = leaflet.DomUtil.create('button2', className, container2);
        var btn3 = leaflet.DomUtil.create('button2', className, container3);

        container.appendChild(container2);
        container.appendChild(container3);

        btn.innerHTML = "Map Selection";
        btn2.innerHTML = "Button1";
        btn3.innerHTML = "Button2";

        var new_layer = this._layers[0].layer;

        function myFunction() {
            new_layer.eachFeature(function(lyr) {
                if (lyr.feature.properties.selected){
                    console.log(lyr.feature.id);
                }
            })
          }

        L.DomEvent.on( btn, 'click', myFunction);

        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

    _addLayer: function (layer, name, overlay) {
        this._layers.push({
            layer: layer,
            name: name,
            overlay: overlay,
        });
    },

});

L.control.MapSelection = function(layer, options) {
    return new L.Control.MapSelection(layer, options);
}