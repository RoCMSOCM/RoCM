var font = "12px sans-serif";
document.getElementById("graph").style.font = font;

$("#save").button();

$("#simulate").button();

create_dropdown_div("about_wrapper", "about_button", "up");

$("#about_button").click(function () {
  var this_button = $(this);  

  this_button.data('state', (this_button.data('state') == 'up') ? 'down' : 'up');
  
  $('html, body').animate({
    scrollTop: 2000
  }, this_button.data('state') == 'up' ? 1000 : 1000); //TODO: Fix this when scrolling up as it's closing
});


// PARAMS = new Params(); //Inherit Array into Params
VDATA = new VData();

PARAMS = new ParamsDict();

// Params Import
import_constants("../data/params/MILKY_WAY_CONSTANTS.csv");

// Galaxy Name
var galaxy_name;

// CurvePlot
var url = window.location.href;
var gid = "#GID=";

if(url.contains(gid)){
	galaxy_name = url.split(gid)[1];
} else {
	galaxy_name = "NGC-2403";
}

var rocm_url = "#GID="+galaxy_name;
window.location.href = rocm_url;

create_curve_plot("../data/velocity/" + galaxy_name + ".csv");

// SOCM Table
create_dropdown_div("socmt_wrapper", "display_button", "down");

create_table("../data/params/COMBINED_TABLE.csv");

GMODEL = new GalacticModel();

CONVERT = new Conversion();


// To add your own model
// GMODEL["VROT_NAME"] = function(Rkpc) {
//   var vrot;

//   // Fill

//   return vrot;
// };