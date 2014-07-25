VDATA = new VData();

PARAMS = new ParamsDict();

SOCMPARAMS = [];

GMODEL = new GalacticModel();

STYLE = new GalacticModelStyleDict();

CONVERT = new Conversion();

GLOBAL_BULGE = true;

var font = "12px sans-serif";
var GALAXY_NAME;
var	socm_url = "http://socm.herokuapp.com/galaxies";

$( document ).ready(function() { 

	// Initial interface formatting

	document.getElementById("graph").style.font = font;

	// RoCM URL with GID 
	var url = window.location.href;
	var gid = "#GALAXY=";

	if(url.contains(gid))
		GALAXY_NAME = url.split(gid)[1];
	else{
		GALAXY_NAME = "MILKY-WAY";
		localStorage.removeItem("PARAMS");
	}

	// Coming in from RoCS or just hit "Back" on the browser, update function.
	update_session();

	$("#slider_button").button();

	$("#save").button();

	$("#simulate").button().click(function(){
		send_to_rocs();
	});

	$("#add_model").button();

	create_dropdown_div("about_wrapper", "about_button", "up");

	$("#about_button").click(function () {
	  var this_button = $(this);  

	  this_button.data('state', (this_button.data('state') == 'up') ? 'down' : 'up');
	  
	  $('html, body').animate({
	    scrollTop: 2000
	  }, this_button.data('state') == 'up' ? 1000 : 1000); //TODO: Fix this when scrolling up as it's closing
	});

	// Update the GalacticModelStyles for the currently implemented models
	style_galactic_models();

	// SOCM Table dropdown overlay
	create_dropdown_div("socmt_wrapper", "display_button", "down");

	// Parameter Fitting Slider dropdown overlay
	create_dropdown_div("sliders", "slider_button", "down");

	// RoCM and SOCM Logic
	var allGalaxiesEndpoint = socm_url + ".json?page=false"

	GLOBAL_BULGE = default_bulge(GALAXY_NAME);

	// SOCM Parameters Import
	import_socm_galaxies(allGalaxiesEndpoint); 

	var rocm_url = "#GALAXY="+GALAXY_NAME;
	window.location.href = rocm_url;

	PARAMS.initialize("galaxy_name", GALAXY_NAME);
});