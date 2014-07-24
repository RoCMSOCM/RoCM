VDATA = new VData();

PARAMS = new ParamsDict();

SOCMPARAMS = [];

GMODEL = new GalacticModel();

CONVERT = new Conversion();

var font = "12px sans-serif";
var galaxy_name;
var	socm_url = "http://socm.herokuapp.com/galaxies";

$( document ).ready(function() { 

	// Initial interface formatting

	document.getElementById("graph").style.font = font;

	$("#slider_button").button();

	$("#save").button();

	$("#simulate").button();

	$("#add_model").button();

	create_dropdown_div("about_wrapper", "about_button", "up");

	$("#about_button").click(function () {
	  var this_button = $(this);  

	  this_button.data('state', (this_button.data('state') == 'up') ? 'down' : 'up');
	  
	  $('html, body').animate({
	    scrollTop: 2000
	  }, this_button.data('state') == 'up' ? 1000 : 1000); //TODO: Fix this when scrolling up as it's closing
	});

	// SOCM Table dropdown overlay
	create_dropdown_div("socmt_wrapper", "display_button", "down");

	// Parameter Fitting Slider dropdown overlay
	create_dropdown_div("sliders", "slider_button", "down");

	// RoCM and SOCM Logic
	var allGalaxiesEndpoint = socm_url + ".json?page=false"

	// SOCM Parameters Import
	import_socm_galaxies(allGalaxiesEndpoint); 

	// RoCM URL with GID 
	var url = window.location.href;
	var gid = "#GALAXY=";

	if(url.contains(gid)){
		galaxy_name = url.split(gid)[1];
	} else {
		galaxy_name = "MILKY-WAY";
	}

	var rocm_url = "#GALAXY="+galaxy_name;
	window.location.href = rocm_url;

});
