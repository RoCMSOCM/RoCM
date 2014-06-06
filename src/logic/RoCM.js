var font = "12px sans-serif";
document.getElementById("graph").style.font = font;

$("#save").button();

$("#simulate").button();

create_dropdown_div("about_wrapper", "about_button", "up");

$("#about_button").click(function () {
  var this_button = $(this);  

  this_button.data('state', (this_button.data('state') == 'up') ? 'down' : 'up');
  
  $('html, body').animate({
    scrollTop: 1000
  }, this_button.data('state') == 'up' ? 1000 : 1000); //TODO: Fix this when scrolling up as it's closing
});

PARAMS = new Params();
VDATA = new VData();

// Params Import
import_constants();

// CurvePlot
create_curve_plot();

// SOCM Table
create_dropdown_div("socmt_wrapper", "display_button", "down");

csvFileName = "../../data/params/COMBINED_TABLE.csv";

create_table(csvFileName);


model = new GalacticModel();
