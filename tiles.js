/* <![CDATA[ */
// Google Maps Demo
//////////////////////////////////
var Demo = Demo || {};

var zoomlevel = 2;

Demo.ImagesBaseUrl = 'http://www.nevis.columbia.edu/~dcaratelli/';

// EarthMap class
//////////////////////////////////
Demo.EarthMap = function (container) {
    // Create map
    this._map = new google.maps.Map(container, {
        zoom: 2,
        //position: google.map.ControlPosition.TOP_CENTER,
        center: {lat: -10, lng: 140},
        disableDefaultUI: false,
        scaleControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: true,
        rotateControl: true,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    
    // Set custom tiles
    this._map.mapTypes.set('event', new Demo.ImgMapType('event', '#FFF'));
    this._map.setMapTypeId('event');
    
    // Create custom controls & bind events
    this._createControls();
    this._bindEvents();
    
    //this._zoom = 2;
};

Demo.EarthMap.prototype._createControls = function () {
    var self = this;
    
    // Info window
    this._window = new Demo.TextWindow(this._map);
    
    var centerMap = document.createElement('DIV');
    centerMap.style.margin = '10px 10px 10px 10px';
    new Demo.CenterControl(centerMap, this._map);
    
    var homePage = document.createElement('DIV');
    homePage.style.margin = '10px 10px 10px 10px';
    new Demo.HomePage(homePage, this._map);
    
    var scale = document.createElement('DIV');
    scale.style.margin = '10px 10px 10px 10px';
    new Demo.Scale(scale, this._map);                 
    
    //scale.addListener(this._map, 'zoom_changed', function() {} );
    google.maps.event.addListener(this._map, 'zoom_changed', function() { Demo.UpdateScale(scale,this.getZoom()); } );
    
    this._map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerMap);
    this._map.controls[google.maps.ControlPosition.LEFT_TOP].push(homePage);
    this._map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(scale);
    
};


Demo.EarthMap.prototype._bindEvents = function () {
    var self = this;
    
    google.maps.event.addListener(this._map, 'click', function () { self._window.close(); });
    //
};

// ImgMapType class
//////////////////////////////////
Demo.ImgMapType = function (theme, backgroundColor) {
    this.name = this._theme = theme;
    this._backgroundColor = backgroundColor;
};

Demo.ImgMapType.prototype.tileSize = new google.maps.Size(450, 229);
Demo.ImgMapType.prototype.minZoom = 2;
Demo.ImgMapType.prototype.maxZoom = 6;

Demo.ImgMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
    var tilesCount = Math.pow(2, zoom);
    
    if (coord.x >= tilesCount || coord.x < 0 || coord.y >= tilesCount || coord.y < 0) {
        var div = ownerDocument.createElement('div');
        div.style.width = this.tileSize.width + 'px';
        div.style.height = this.tileSize.height + 'px';
        div.style.backgroundColor = this._backgroundColor;
        return div;
    }
    
    var img = ownerDocument.createElement('IMG');
    img.width = this.tileSize.width;
    img.height = this.tileSize.height;
    img.src = Demo.Utils.GetImageUrl(this._theme + '/tile_' + zoom + '_' + coord.x + '-' + coord.y + '.png');
    
    return img;
};

// ImageControl class
//////////////////////////////////
Demo.ImageControl = function (image, container, map, callback) {
    var button = document.createElement('IMG');
    button.style.cursor = 'pointer';
    button.style.display = 'block';
    button.src = Demo.Utils.GetImageUrl(image);
    container.appendChild(button);
    
    google.maps.event.addDomListener(button, 'click', function () {
        callback();
    });
};

// TextWindow class
//////////////////////////////////
Demo.TextWindow = function (map) {
    this._map = map;
    this._window = null;
    this._text = null;
    this._position = null;
};

Demo.TextWindow.prototype = new google.maps.OverlayView();

Demo.TextWindow.prototype.open = function (latlng, text) {
    if (this._window != null) this.close();
    
    this._text = text;
    this._position = latlng;
    
    this.setMap(this._map);
};

Demo.TextWindow.prototype.close = function () {
    this.setMap(null);
};

Demo.TextWindow.prototype.onAdd = function () {
    this._window = document.createElement('DIV');
    this._window.style.position = 'absolute';
    this._window.style.cursor = 'default';
    this._window.style.padding = '40px 20px 0px 20px';
    this._window.style.textAlign = 'center';
    this._window.style.fontFamily = 'Arial,sans-serif';
    this._window.style.fontWeight = 'bold';
    this._window.style.fontSize = '12px';
    this._window.style.width = '88px';
    this._window.style.height = '88px';
    this._window.style.background = 'url(' + Demo.Utils.GetImageUrl('window.png') + ')';
    this._window.innerHTML = this._text;
    
    this.getPanes().floatPane.appendChild(this._window);
};

Demo.TextWindow.prototype.draw = function () {
    var point = this.getProjection().fromLatLngToDivPixel(this._position);
    
    this._window.style.top = (parseInt(point.y) - 128) + 'px';
    this._window.style.left = (parseInt(point.x) - 110) + 'px';
};

Demo.TextWindow.prototype.onRemove = function () {
    this._window.parentNode.removeChild(this._window);
    this._window = null;
};

// Other
//////////////////////////////////
Demo.Utils = Demo.Utils || {};

Demo.Utils.GetImageUrl = function (image) {
    return Demo.ImagesBaseUrl + image;
};

Demo.Utils.SetOpacity = function (obj, opacity /* 0 to 100 */ ) {
    obj.style.opacity = opacity / 100;
    obj.style.filter = 'alpha(opacity=' + opacity + ')';
};


// the smooth zoom function
Demo.smoothZoom = function (map, min, cnt) {
    if (cnt <= min) {return;}
    else {
        z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            Demo.smoothZoom(map, min, cnt - 1);
        });
        setTimeout(function(){map.setZoom(cnt)}, 40); // 80ms is what I found to work well on my system -- it might not work well on all systems
    }
};  



Demo.CenterControl = function ( controlDiv, map) {
    
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);
    
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Center View';
    controlUI.appendChild(controlText);
    
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
        map.setZoom(2);
        map.setCenter({lat: -10, lng: 120});
        //Demo.smoothZoom(map, 2, map.getZoom() );
    });
    
};


Demo.HomePage = function ( controlDiv, map) {
    
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'MicroBooNE Homepage';
    controlDiv.appendChild(controlUI);
    
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'About MicroBooNE';
    controlUI.appendChild(controlText);
    
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
        window.location.href = 'http://www-microboone.fnal.gov/';
    });
    
};


Demo.Scale = function ( controlDiv, map) {
    
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = '4px solid #fff';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = '0 0px 0px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Event Scale';
    //controlUI.style.opacity = '0.5';
    controlUI.style.borderBottomColor = 'white';
    controlUI.style.borderTopColor = 'transparent';
    controlUI.style.borderRightColor = 'transparent';
    controlUI.style.borderLeftColor = 'transparent';
    controlUI.style.minWidth = '100px';
    controlUI.style.maxWidth = '100px';
    controlDiv.appendChild(controlUI);
    
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(255,255,255)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    
    controlText.innerHTML = Math.round(230/Math.pow(2,map.getZoom())) + ' cm';
    controlUI.appendChild(controlText);
    
};


Demo.UpdateScale = function ( scale, zoom) {
    
    while (scale.firstChild) { scale.removeChild(scale.firstChild); } 
    
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'transparent';
    controlUI.style.border = '4px solid #fff';
    controlUI.style.borderRadius = '0px';
    controlUI.style.boxShadow = '0 0px 0px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Event Scale';
    //controlUI.style.opacity = '0.5';
    controlUI.style.borderBottomColor = 'white';
    controlUI.style.borderTopColor = 'transparent';
    controlUI.style.borderRightColor = 'transparent';
    controlUI.style.borderLeftColor = 'transparent';
    controlUI.style.minWidth = '100px';
    controlUI.style.maxWidth = '100px';
    scale.appendChild(controlUI);
    
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(255,255,255)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    
    controlText.innerHTML = Math.round(230/Math.pow(2,zoom)) + ' cm';
    controlUI.appendChild(controlText);
};
