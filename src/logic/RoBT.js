// RoBT.js
// Rotation Bit Transfer (alt: Reference Object Byte Transfer)
// The bridge between RoCM, SOCM, and RoCS

function RoBT() {/*Default constructor*/}

RoBT.prototype = {

}

function import_constants() {
  // TODO FIX: Import constants without formatting 
  d3.csv("../../data/velocity/MILKY_WAY_CONSTANTS.csv", function(error, data) {
    data = data[0];

    //Defines globals r0, sigma0, R0, and N* from the constants CSV
    PARAMS.r0 = +data.r0.split(" ")[0];
    PARAMS.sigma0 = +data.sigma0.split(" ")[0];
    PARAMS.R0kpc = +data.R0.split(" ")[0];
    PARAMS.Nstar = +data["N*"];

    PARAMS._r0 = PARAMS.r0;
    PARAMS._sigma0 = PARAMS.sigma0;
    PARAMS._R0kpc = PARAMS.R0kpc;
    PARAMS._Nstar = PARAMS.Nstar;

    initialize_sliders();
  });

  // TODO FIX: Import the formatted constants (html formatting, superscripts, subscripts, etc.)
  d3.csv("../../data/velocity/MILKY_WAY_CONSTANTS_FORMATTED.csv", function(error, data) {
    div_id = "constants_table";
  	create_param_table(div_id, data);

  });
}

function send_to_rocs(galaxy_name) {
  var vrot_name = "";
  var vels = [];
  var opac = [];

  $('.velocity path').each(function () {
    vel = $(this).attr('class'); 
    op = +$(this).css('opacity');
    if(op == 1)
      vels.push(vel);
  });

  total_count = vels.length;
  data_count = 0;
  model_count = 0;
  models = [];

  for(var i=0;i<vels.length;i++){
    if(vels[i].contains("DATA"))
      data_count++;
    else{
      model_count++;
      models.push(vels[i]);
    }
  }

  if(data_count == total_count)
  {
    vrot_name = "VROT_DATA"
  }
  else if(model_count == 1){
    vrot_name = models[0];
  } 
  else
  {
    alert('Select only one model to simulate.\nOr\nSelect only the data.\n\n(click the legend)')
    return;
  }

  var rocs_url = "./RoCS.html#"+galaxy_name+"#"+vrot_name;
  window.location.href = rocs_url;
}