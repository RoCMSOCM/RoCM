// SOCMBridge.js
// The bridge between RoCM, SOCM, and RoCS

function SOCMBridge() {/*Default constructor*/};

SOCMBridge.prototype = {};

function import_socm_galaxies(galaxyEndpoint) {
  d3.json(galaxyEndpoint, function(error, data) {

    data.forEach(function(d) {
      d = add_table_elements(d);
      SOCMPARAMS[d.galaxy_name] = d;
    });

    create_socm_table(data);
    create_curve_plot(galaxy_name, true);
  });
}

function import_parameters(data, is_initial) {    
  var table_id = "params_table";    
  var data_keys = Object.keys(data);

  for(var i=0;i<data_keys.length;i++){
    var key = data_keys[i];

    // Split the incoming data by delim. Ex: white space, '1.232 kpc'
    // Splits by first occurance of delim
    // var delim = " ";
    // var split_data = data[key].split(delim);
    // var joined_split = [split_data.shift(), split_data.join(delim)];
    // var value = +joined_split[0];
    // var units = joined_split[1];
     
    var param = new Param(data[key]);//new Param(value, units);

    PARAMS.add(key, param);

    if(!is_initial)
      update_param_table(key);
  }

  //TODO: Short name -> Long name parameter mapping
  PARAMS.add("R0", PARAMS.getParam("scale_length"));

  // ParamSlider initial sliders
  slider_map = {
    "mass_disk":{min:0.01, max:20},
    // "N*":{min:0.01*Math.pow(10,10), max:4.0*Math.pow(10,11)},
    "r0":{min:0, max:100},
    "sigma0":{min:1.0*Math.pow(10,-10), max:1.0*Math.pow(10,-6)}
  };


  if(is_initial){
    initialize_default_parameters();
    initialize_sliders(slider_map);
  }

  // MOND Parameter fitting sliders
  /*  var solar_mass = CONST.get("Mo");
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
  */

  // Filter mutable parameters for the ParamsTable
  data = filter_parameters(data);


  if(is_initial)
    create_param_table(table_id, data);
}

function send_to_rocs() {
  var url = window.location.href;
  var galaxy_name = url.split("#")[1].replace("GALAXY=", "");
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


  var R = VDATA.R;
  var VROT = VDATA[vrot_name];
  localStorage.setItem('R', JSON.stringify(R));
  localStorage.setItem('VROT', JSON.stringify(VROT));

  vrot_name = vrot_name.replace("VROT_", "");

  localStorage.setItem("vrot_name", vrot_name);
  localStorage.setItem("galaxy_name", galaxy_name);

  var rocs_url = "rocs/index";
  window.location.href = rocs_url;
}

function add_table_elements(d) {  
  var velocities_count = d.velocities_count;
  delete d.velocities_count;

  var citations = d.citation_ids_array;
  delete d.citation_ids_array;

  // Rounding last R value
  var r_last = d.r_last;
  d.r_last = Math.round(d.r_last * 1000) / 1000;

  // Mass to light ratio
  d.mass_light_ratio = Math.round((d.mass_disk / d.luminosity) * 100) / 100;

  // Universal constant (Mannheim & O'Brien)
  d.universal_constant = Math.round(universal_constant(d.vrot_data_last,r_last) * 1000) / 1000;

  // Number of velocities
  d.velocities_count = velocities_count;

  // citations
  d.citation_ids_array = citations;

  // Plot and Download buttons
  d.Functions = "<button class='plot' id='" + d.galaxy_name + "-PLOT''>Plot</button> | <button class='download' id='" + d.id + "-DOWNLOAD' name='" + d.galaxy_name + "'>Download</button>"

  return d;
}


//TODO: FIX GALAXYS THAT HAVE A r_last VERY SMALL. ERROR IS CSV.