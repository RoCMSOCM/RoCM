// SOCMBridge.js
// The bridge between RoCM, SOCM, and RoCS

function SOCMBridge() {/*Default constructor*/};

SOCMBridge.prototype = {};

function import_constants(csv_filename) {
  // TODO FIX: Import constants without formatting 
  d3.csv(csv_filename, function(error, data) {
    div_id = "constants_table";
    create_param_table(div_id, data);

    data = data[0];

    var data_keys = Object.keys(data);

    // TODO: Handle this better (pregenerated sliders)
    var gen_sliders = ["N*", "r0", "sigma0"];

    for(var i=0;i<data_keys.length;i++){
      var key = data_keys[i];

      // Split the incoming data by delim. Ex: white space, '1.232 kpc'
      // Splits by first occurance of delim
      var delim = " ";
      var split_data = data[key].split(delim);
      var joined_split = [split_data.shift(), split_data.join(delim)];
      var value = +joined_split[0];
      var units = joined_split[1];
       
      var param = new Param(value, units);

      PARAMS.add(key, param);
    }

    // TODO: Include B* or calculate it.
    PARAMS.add("B", new Param(1.48, "km"));
    var bulge_b = 0.611499 // *10^10
    var bulge_t = 0.0939927
    PARAMS.add("BULGE_B", new Param(bulge_b)) // *10^10
    PARAMS.add("BULGE_T", new Param(bulge_t))

    // ParamSlider initial sliders
    slider_map = {
      "N*":{min:0.01*Math.pow(10,10), max:4.0*Math.pow(10,11)},
      "r0":{min:0, max:100},
      "sigma0":{min:1.0*Math.pow(10,-10), max:1.0*Math.pow(10,-6)}
    };
    initialize_sliders(slider_map);

    // MOND Parameter fitting sliders
    var solar_mass = CONST.get("Mo");
    var M0 = 9.60 * Math.pow(10, 11) * solar_mass;
    var M0param = new Param(M0, "kg");
    PARAMS.add("M0", M0param);
    var M0slider = new ParamSlider("M0", M0param);


    var MONDr0 = 4.30*Math.pow(10, 22); // cm
    var MONDr0param = new Param(MONDr0, "cm");
    PARAMS.add("MONDr0", MONDr0param);
    var MONDr0slider = new ParamSlider("MONDr0", MONDr0param);
    

    var a0 = CONVERT.cm_to_km(6.90*Math.pow(10,-8)); //cm/s^2 -> km/s^2
    var G0 = (a0*Math.pow(MONDr0,2)) / M0;
    var G0param = new Param(G0, "kg");
    PARAMS.add("G0", G0param);
    var G0slider = new ParamSlider("G0", G0param);

  });

  // TODO FIX: Import the formatted constants (html formatting, superscripts, subscripts, etc.)
  // d3.csv("../data/params/MILKY_WAY_CONSTANTS_FORMATTED.csv", function(error, data) {
  //  //  div_id = "constants_table";
  // 	// create_param_table(div_id, data);
  // });
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