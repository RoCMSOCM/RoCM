VDATA = new VData();

PARAMS = new ParamDict();

SOCMPARAMS = [];

GMODEL = new GalacticModel();

STYLE = new GalacticModelStyleDict();

CONVERT = new Conversion();

GLOBAL_BULGE = false; // updated via default_bulge(galaxy_name)

UPDATE_Y_AXIS = false; // updated via update_session()

$(document).ready(function() { 
	// Initial interface formatting

	// $("#graph").css("font-family", FONT);

	// RoCM URL with GID 
	var galaxy_name;
	var url = window.location.href;
	var gid = "#GALAXY=";

	if(url.contains(gid))
		galaxy_name = url.split(gid)[1];
	else{
		galaxy_name = "MILKY-WAY";
	}

	// Coming back from RoCS
	// or
	// Hit "Back" on the browser
	update_session();

	$("#simulate").click(function(){
		send_to_rocs();
	});

	$("#reset_positions").click(reset_positions);

	$("#reset_rocm").click(function() {
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
	create_dropdown_div("socmt_wrapper", "galaxy_button", "down");

	// Parameter Fitting Slider dropdown overlay
	create_dropdown_div("sliders", "slider_button", "down");

	// RoCM and SOCM Logic
	var allGalaxiesEndpoint = "http://socm.herokuapp.com/galaxies.json?page=false"

	GLOBAL_BULGE = default_bulge(galaxy_name);

	// Create the CurvePlot svg before drawing to it (Firefox NS_ERROR_FAILURE)
	create_curve_plot_svg();

	// SOCM Parameters Import for all galaxies (and include the current galaxy_name)
	import_socm_galaxies(allGalaxiesEndpoint, galaxy_name); 

	var rocm_url = "#GALAXY="+galaxy_name;
	window.location.href = rocm_url;

	PARAMS.initialize("galaxy_name", galaxy_name);

	$("button").addClass("default_button");
});

function reset_positions() {
	$(".draggable").each(function() {
		var element = $(this);
		element.css({
			"left": element.data("originalLeft"),
			"top": element.data("origionalTop")
		});
	});

	$(".draggable_child").each(function() {
		var element = $(this);
		element.attr({
			"x": element.data("originalX"),
			"y": element.data("origionalY")
		});
	});

	var sliders = $("#sliders");

	sliders.css("width", sliders.data().originalWidth);
}

function reset_rocm() {
	var galaxy_name = PARAMS.get("galaxy_name");

	var rocm_url = "#GALAXY="+galaxy_name;
	window.location.href = rocm_url;
	
	$(this).scrollTop(0);
	window.location.reload();
}