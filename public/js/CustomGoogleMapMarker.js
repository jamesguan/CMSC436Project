function CustomMarker(latlng, map, args) {
	this.latlng = latlng;	
	this.args = args;	
	this.setMap(map);	
}

function initializeCustomMapMarker() {
	CustomMarker.prototype = new google.maps.OverlayView();

	CustomMarker.prototype.draw = function() {

		var self = this;

		var div = this.div;

        var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

		if (!div) {

			div = this.div = document.createElement('div');

			div.className = 'marker';
			div.id = self.args.marker_id;

			div.style.position = 'absolute';
			div.style.cursor = 'pointer';
			div.style.width = '54px';
			div.style.height = '64px';
			//div.style.background = 'blue';

			if (typeof(self.args.marker_id) !== 'undefined') {
				div.dataset.marker_id = self.args.marker_id;
			}


			google.maps.event.addDomListener(div, "click", function(event) {
				//alert('You clicked on a custom marker!' + self.args.marker_id);
                createViz(self.args.marker_id.replaceAll("-","."));
				//google.maps.event.trigger(self, "click");
			});

            google.maps.event.addDomListener(div, "mouseover", function(event) {
                //var point = self.getProjection().fromLatLngToDivPixel(self.latlng);
                //alert(self.getProjection().fromLatLngToDivPixel(self.latlng).x);
                //alert(self.getPosition().lat());
                /*$('#marker-tooltip').html(self.args.marker_id.replaceAll("-",".")).css({
                    'left': (point.x ) + 'px',
                    'top': (point.y ) + 'px'
                }).show();*/
            });

            google.maps.event.addDomListener(div, "mouseout", function(event) {
               // $('#marker-tooltip').hide();
            });

			var panes = this.getPanes();
			panes.overlayImage.appendChild(div);
		}

		if (point) {
			div.style.left = (point.x - 10) + 'px';
			div.style.top = (point.y - 20) + 'px';
		}

		//createGlyph(self.args.marker_id, self.args.mapData, self.args.mapData.stationData[0]);
	};

	CustomMarker.prototype.remove = function() {
		if (this.div) {
			this.div.parentNode.removeChild(this.div);
			this.div = null;
		}
	};

	CustomMarker.prototype.getPosition = function() {
		return this.latlng;
	};
}

