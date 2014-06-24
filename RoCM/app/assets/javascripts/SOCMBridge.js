// SOCMBridge.js
// The bridge between RoCM, SOCM, and RoCS

function SOCMBridge() {/*Default constructor*/};

SOCMBridge.prototype = {};

function import_constants() {
  // TODO FIX: Import constants without formatting
  d3.json("../data/params/MILKY_WAY_CONSTANTS.csv", function(error, data) {
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
    // PARAMS.set("B", new Param(1.48, "km"));

    // ParamSlider initial sliders
    initialize_sliders();
  });

  // TODO FIX: Import the formatted constants (html formatting, superscripts, subscripts, etc.)
  d3.csv("../data/params/MILKY_WAY_CONSTANTS_FORMATTED.csv", function(error, data) {
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
