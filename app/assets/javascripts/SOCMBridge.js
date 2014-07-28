// SOCMBridge.js
// The bridge between RoCM, SOCM, and RoCS

function SOCMBridge() {/*Default constructor*/};

SOCMBridge.prototype = {};

function import_socm_galaxies(galaxyEndpoint, galaxy_name) {
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

    //TODO: Handle Units for each Param (coming in from SOCM)
    var param = new Param(data[key]);

    PARAMS.initialize(key, param);

    if(!is_initial)
    update_param_table(key);
  }

  // ParamSlider initial sliders
  // Load sliders from previous session
  var slider_configuration = get_slider_configuration();

  if(slider_configuration == null || slider_configuration.length == 0){
    // Default sliders if no previous session
    slider_configuration = [
      "distance",
      "mass_disk",
      "scale_length",
      "dark_halo_radius",
      "dark_matter_density",
      "bulge_b",
      "bulge_t"
      ];
    }

  var params_updated = update_PARAMS();

  if(is_initial){
    if(!params_updated){
      initialize_default_parameters();
    }

    initialize_sliders(slider_configuration);
  }



  if(is_initial){
    var chi_table_id = "chi_table";
    $("#parameters").append($("<table/>")
      .attr("id", chi_table_id)
      .css("float", "left")
      .css("cellspacing", "0"));

    $("#parameters").append($("<table/>")
      .attr("id", table_id)
      .css("float", "right")
      .css("cellspacing", "0"));

    // Filter mutable parameters for the ParamsTable
    var filtered_data = filter_parameters(data);
    create_param_table(table_id, filtered_data);
  }
  if(params_updated) {
    var filtered_data = filter_parameters(PARAMS.getDict());
    update_param_table_with_data(filtered_data);
  }
}

function update_session() {
  var prev_galaxy_style = localStorage.getItem("STYLE_dictionary");

  if(prev_galaxy_style != null && prev_galaxy_style != "[object Object]" && prev_galaxy_style != "{}"){
    STYLE.setDict(JSON.parse(prev_galaxy_style));
  }

  var local_keys = Object.keys(localStorage);
  for(var i=0;i<local_keys.length;i++) {
    var key = local_keys[i];
    if(key.contains("CUSTOM-")){
      var custom_model_body = localStorage.getItem(key);
      var model_name = key.replace("CUSTOM-", "");

      var custom_model = new Function("R", custom_model_body);

      GMODEL[model_name] = custom_model;
    }
    else if(key == "model_input" || key == "model_color" || key == "model_full_name"){
      var input = localStorage.getItem(key);
      $("#" + key).val(input);
    }
  }


}

function update_PARAMS() {
  var prev_PARAMS = localStorage.getItem("PARAMS");

  if(jQuery.isEmptyObject(PARAMS.dictionary))
    return;

  if(prev_PARAMS != null && prev_PARAMS != "[object Object]" && prev_PARAMS != "{}"){
    var parsed_data = JSON.parse(prev_PARAMS);

    if(parsed_data["galaxy_name"].value !== undefined &&  parsed_data["galaxy_name"].value == PARAMS.get("galaxy_name"))
    {
      console.log("Updated " + PARAMS.get("galaxy_name") + " with previous parameters.")
      PARAMS.setDict(parsed_data);
      return true;
    }
  }
  // else
    // localStorage.removeItem("PARAMS");

  return false;
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
  d.Functions = "<button class='plot' id='" + d.galaxy_name + "-PLOT'' style='font-size: .8em !important;'>Plot</button><button class='download' id='" + d.id + "-DOWNLOAD' name='" + d.galaxy_name + "' style='font-size: .8em !important;'>Download CSV</button>"

  return d;
}

function update_derived_elements(param_name) {
  // Updates the parameter that is calculated from and dependent upon another parameter.
  var calculated_param_name;
  var calculated_param;

  if(param_name == "mass_disk" || param_name == "luminosity"){
    calculated_param_name = "mass_light_ratio";

    var mass_disk = PARAMS.get("mass_disk");
    var luminosity = PARAMS.get("luminosity");
    
    calculated_param = Math.round((mass_disk / luminosity) * 100) / 100;    
  }
  else if(param_name == "r_last"){ 
    calculated_param_name = "universal_constant";
 
    var vrot_data_last = PARAMS.get("vrot_data_last");
    var r_last = PARAMS.get("r_last");

    calculated_param = Math.round(universal_constant(vrot_data_last,r_last) * 1000) / 1000;
  }
  else
    return;

  PARAMS.setValue(calculated_param_name, calculated_param);
  update_param_table(calculated_param_name);
}


//TODO: FIX GALAXYS THAT HAVE A r_last VERY SMALL. ERROR IS CSV.