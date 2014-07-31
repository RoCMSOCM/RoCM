VDATA = new VData();

PARAMS = new ParamDict();

SOCMPARAMS = [];

GMODEL = new GalacticModel();

STYLE = new GalacticModelStyleDict();

CONVERT = new Conversion();

GLOBAL_BULGE = false;

var FONT = "12px sans-serif";
var	socm_url = "http://socm.herokuapp.com/galaxies";

$(document).ready(function() { 
	// Initial interface formatting

	document.getElementById("graph").style.font = FONT;

	// RoCM URL with GID 
	var galaxy_name;
	var url = window.location.href;
	var gid = "#GALAXY=";

	if(url.contains(gid))
		galaxy_name = url.split(gid)[1];
	else{
		galaxy_name = "MILKY-WAY";
		// update_PARAMS();
		localStorage.removeItem("PARAMS");
	}

	// Coming in from RoCS or just hit "Back" on the browser, update function.
	update_session();

	$("#slider_button").button();

	$("#save").button({
		icons:{
			secondary: "ui-icon-disk"
		}
	});

	$("#simulate").button({
		icons:{
			secondary: "ui-icon-refresh"
		}
	}).click(function(){
		send_to_rocs();
	});

	$("#reset_rocm").button().click(function() {
		reset_rocm();
	});

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

	GLOBAL_BULGE = default_bulge(galaxy_name);

	// Create the CurvePlot svg before drawing to it (Firefox NS_ERROR_FAILURE)
	create_curve_plot_svg();

	// SOCM Parameters Import for all galaxies (and include the current galaxy_name)
	import_socm_galaxies(allGalaxiesEndpoint, galaxy_name); 

	var rocm_url = "#GALAXY="+galaxy_name;
	window.location.href = rocm_url;

	PARAMS.initialize("galaxy_name", galaxy_name);
});


function reset_rocm() {
	localStorage.clear();

	var galaxy_name = PARAMS.get("galaxy_name");

	var rocm_url = "#GALAXY="+galaxy_name;
	window.location.href = rocm_url;
	
	$(this).scrollTop(0);
	window.location.reload();
}