	var addresses = [{"categoryId": 1, "name" : "25 S Main St, Belmont, NC 28012"},
				{"categoryId": 1, "name" : "5000 Whitewater Center Pkwy, Charlotte, NC 28214"},
				{"categoryId": 1, "name" : "8400 Bellhaven Blvd, Charlotte, NC 28216"},
				{"categoryId": 2, "name" : "3301 Freedom Dr, Charlotte, NC 28208"},
				{"categoryId": 2, "name" : "1115 S Mint St, Charlotte, NC 28203"},
				{"categoryId": 2, "name" : "1224 Commercial Ave, Charlotte, NC 28205"}];

var  MapViewModel  = function(){
	var self = this;
	var yelp = new YelpDataProvider();

	self.categories = [{"id": 1,"name" : "Bars"}, {"id": 2,"name" : "Gyms"}];
	self.places = ko.observableArray();
	self.selectCategory  = ko.observable();
	
   //  self.selectCategory.subscribe(function(category) {
   //  	var _filtered = addresses;

   //  	if(typeof category != "undefined")
   //  		_filtered = _.where(_filtered, {'categoryId': category});

   //      yelp.getDataForPlaces(_filtered).then(function(place){
			// self.places(place);
		 //  });
   //  });


   self.selectCategory.subscribe(function(category) {
      var adItems = $('.locations li');
      _.each(adItems, function(aditem){
          $(aditem).hide();
      });

      if(typeof category != "undefined"){
        _.each(adItems, function(aditem){
        if($(aditem).children(":first").data('cat') == category)
          $(aditem).show();
        });  
      }else{
        _.each(adItems, function(aditem){
          $(aditem).show();
        });
      }
      
    });

	yelp.getDataForPlaces(addresses).then(function(place){
		self.places(place);
	})
};

// ko.bindingHandlers.googlemap = {
//     init: function (element, valueAccessor) {
//         var value = ko.utils.unwrapObservable(valueAccessor());
//         var mapOptions = {
//             zoom: 10,
//             center: new google.maps.LatLng(places[0].businesses[0].location.coordinate.latitude,
//              places[0].businesses[0].location.coordinate.longitude),
//             mapTypeId: google.maps.MapTypeId.ROADMAP
//             };
//           var map = new google.maps.Map(element, mapOptions);


//         var places = ko.observableArray();
//         places = value.places();

//         _.each(places, function(place){
//         	console.log(place);
//   			var point = new google.maps.LatLng(place.businesses[0].location.coordinate.latitude,
//   			 				place.businesses[0].location.coordinate.longitude);
//   			var marker = createMarker(point, place.businesses[0].id, place.businesses[0].snippet_text);      	
//         });
//     }
// };

ko.applyBindings(MapViewModel);



// arrays to hold copies of the markers and html used by the side_bar 
// because the function closure trick doesnt work there 
var gmarkers = [];
var map = null;

function initialize() {
  var yelp = new YelpDataProvider();
  var myWrapper = $("#wrapper");
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    $('.locations').hide()
    myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
      // code to execute after transition ends
      google.maps.event.trigger(map, 'resize');
      if($('.toggled').length == 0){
        $('.locations').show()
      }
    });
  });

  
  yelp.getDataForPlaces(addresses).then(function(places){
    var myOptions = {
    zoom: 10,
    center: new google.maps.LatLng(places[0].businesses[0].location.coordinate.latitude, places[0].businesses[0].location.coordinate.longitude),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById("map_canvas"),
    myOptions);

  console.log(places);
  for (var i = 0; i < places.length; i++) {
      var address  = addresses[i];
      var point = new google.maps.LatLng(places[i].businesses[0].location.coordinate.latitude, places[i].businesses[0].location.coordinate.longitude);
      var info = '<div class="media" data-cat="'+ address.categoryId +'">' +
                    '<div class="media-left">' +
                        '<a data-bind="'+  places[i].businesses[0].url +'">'+
                            '<img class="media-object" src="'+ places[i].businesses[0].image_url+'" >'+
                        '</a>'+
                     '</div>'+
                      '<div class="media-body">'+
                        '<h5 style="text-transform:uppercase" class="media-heading">'+
                        '<a target="_blank" href="'+places[i].businesses[0].url+'">'+places[i].businesses[0].name+'</a></h4>'+
                        '<p>'+places[i].businesses[0].display_phone+'</p>'+
                        '<p>'+places[i].businesses[0].snippet_text+'</p>'+
                      '</div>'+
                   '</div>';
        var marker = createMarker(point, places[i].businesses[0].name,info);
    }

  google.maps.event.addListener(map, 'click', function() {
    infowindow.close();
  });

  });
  
}

var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(100, 200)
});

// This function picks up the click and opens the corresponding info window
function myclick(i) {
  google.maps.event.trigger(gmarkers[i], "click");
}

// A function to create the marker and set up the event window function 
function createMarker(latlng, name, html) {
  var contentString = html;
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
  // save the info we need to use later for the side_bar
  gmarkers.push(marker);
  // add a line to the side_bar html
  var sidebar = $('#sidebar-wrapper ul');

  var sidebar_entry = $('<li/>', {
    'html': contentString,
    'click': function() {
      google.maps.event.trigger(marker, 'click');
    },
    'mouseenter': function() {
      $(this).css('color', '#909090');
    },
    'mouseleave': function() {
      $(this).css('color', '#000');
    }
  }).appendTo(sidebar);
}

 google.maps.event.addDomListener(window, 'load', initialize);




