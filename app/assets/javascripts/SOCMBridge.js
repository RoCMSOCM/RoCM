// SOCMBridge.js
// The bridge between RoCM, SOCM, and RoCS

function SOCMBridge() {/*Default constructor*/};

SOCMBridge.prototype = {};

function import_socm_galaxies(galaxyEndpoint, galaxy_name) {
  d3.json(galaxyEndpoint, function(error, data) {

    data.forEach(function(d) {
      d = add_table_elements(d);
      SOCMPARAMS[d.galaxy_name] = JSON.parse(JSON.stringify(d));

      // Post deletion
      delete d.velocities_citation;
      delete d.luminosity_citation;
      delete d.scale_length_citation;
      delete d.mass_hydrogen_citation;
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
    var param;

    if(FORMATTED_MAP[key] !== undefined)
      var units = "";
      try {
        units = FORMATTED_MAP[key].units;
      } 
      catch(error) {
        units = units;
      }

      var multiplier = 1;
      try {
        multiplier = FORMATTED_MAP[key].multiplier;
      } 
      catch(error) {
        multiplier = multiplier;
      }

      param = new Param(data[key], units, multiplier);
    

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
      "mass_disk",
      "mass_hydrogen",
      "scale_length"
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


  var savedBoolean = localStorage.getItem("UPDATE_Y_AXIS");
  if(savedBoolean != null)
    UPDATE_Y_AXIS = (savedBoolean == "true");

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
  d.citation_ids_array = "Citations"; //use the citations object

  // Plot and Download buttons
  d.Functions = "<button class='plot function_button default_button btn-xs' id='" + d.galaxy_name + "-PLOT'' style='font-size: .8em !important;'>"
                + "Plot"
                + "</button>"
                + "<button class='deltav_plot function_button default_button btn-xs' id='" + d.id + "-DELTAV' name='" + d.galaxy_name + "' style='font-size: .8em !important;'>"
                + "ΔV/V"
                + "</button>"
                + "<button class='parameters_download download default_button btn-xs' id='" + d.id + "-DOWNLOAD' name='" + d.galaxy_name + "' style='font-size: .8em !important;'>"
                + "Parameters CSV"
                + "</button>"
                + "<button class='velocities_download download default_button btn-xs' id='" + d.id + "-DOWNLOAD' name='" + d.galaxy_name + "' style='font-size: .8em !important;'>"
                + "Velocities CSV"
                + "</button>";

  return d;
}


// Handles all the parameters that are dependent upon other parameters (derived or calculated from other values)
function update_derived_parameters(param_name) {
  // Updates the parameter that is calculated from and dependent upon another parameter.
  var calculated_param_name = [];
  var calculated_param = [];

  if(param_name == "mass_disk" || param_name == "luminosity"){
    calculated_param_name.push("mass_light_ratio");

    var mass_disk = PARAMS.getValue("mass_disk");
    var luminosity = PARAMS.getValue("luminosity");
    
    calculated_param.push(Math.round((mass_disk / luminosity) * 100) / 100); 
  }
  else if(param_name == "r_last"){ 
    calculated_param_name.push("universal_constant");
 
    var vrot_data_last = PARAMS.getValue("vrot_data_last");
    var r_last = PARAMS.getValue("r_last");

    calculated_param.push(Math.round(universal_constant(vrot_data_last,r_last) * 1000) / 1000);
  }
 else if(param_name == "distance") {
  // Change: 
  //         R (recalculate models AND data)
  //         scale_length (function of distance)
  //         mass_hydrogen (function of estimated distance)

    // Convert original Rkpc to Rarcsec
    // Calculate Rkpc according to original Rarcsec and changed distance value

    if(VDATA._R !== undefined) {
      var _Rkpc = VDATA._R;
      var _DMpc = PARAMS.getOriginal("distance");
      var DMpc = PARAMS.getValue("distance");

      for(var i=0; i<_Rkpc.length; i++) {
        var _Rarcsec = kpc_to_arcsec(_Rkpc[i], _DMpc);

        VDATA.R[i] = arcsec_to_kpc(_Rarcsec, DMpc);
      }

      update_x_axis(0, d3.max(VDATA.R));

      // update_data(VDATA.R);
      // update_error_bar(VDATA.R);

      update_models();

      var ratio = (DMpc/_DMpc);
      var ratio_sqr = Math.pow(ratio, 2);

      var _scale_length = PARAMS.getOriginal("scale_length");
      var scale_length_new = _scale_length * ratio;
      calculated_param_name.push("scale_length");
      calculated_param.push(scale_length_new);

      var _luminosity = PARAMS.getOriginalValue("luminosity");
      var luminosity_new = _luminosity * ratio_sqr;
      calculated_param_name.push("luminosity");
      calculated_param.push(luminosity_new);

      var _mass_hydrogen = PARAMS.getOriginalValue("mass_hydrogen");
      var mass_hydrogen_new = _mass_hydrogen * ratio_sqr;
      calculated_param_name.push("mass_hydrogen");
      calculated_param.push(mass_hydrogen_new);
    }
  }
  else if(param_name == "inclination_angle") {
    if(VDATA._VROT_DATA !== undefined) {
      var _inclination_angle = PARAMS.getOriginal("inclination_angle");
      _inclination_angle = CONVERT.degree_to_radian(_inclination_angle);

      var inclination_angle = PARAMS.get("inclination_angle");
      inclination_angle = CONVERT.degree_to_radian(inclination_angle);

      var inc_sin = Math.sin(_inclination_angle)/Math.sin(inclination_angle);

      Object.keys(VDATA).map(function(d) {
        if(d != "R" && d[0] != "_"){
          var size = VDATA[d].length;
          var _VROT = VDATA["_" + d];
          if(_VROT !== undefined && _VROT.length > 0){
            for(var i=0; i<size; i++){
              VDATA[d][i] = _VROT[i] * inc_sin;
            }
          }
        }
      });

      update_y_axis(0, d3.max(VDATA.VROT_DATA));

      update_models();

      //TODO: 
      // INIT / NEW in dwarfs\mod_pdfs\ugc4499_2010_mod.pdf
      // NEW / INIT in dwarfs\ddo50\ddo50.pdf (where NEW == INIT)
      var inc_cos = Math.cos(_inclination_angle)/Math.cos(inclination_angle);

      var _mass_hydrogen = PARAMS.getOriginalValue("mass_hydrogen");
      var mass_hydrogen_new = _mass_hydrogen * inc_cos;
      calculated_param_name.push("mass_hydrogen");
      calculated_param.push(mass_hydrogen_new);
    }
  }




  // Update the PARAMS object, ParamTable, and ParamSliders.
  for(var i=0;i<calculated_param_name.length;i++) {
    PARAMS.setValue(calculated_param_name[i], calculated_param[i]);
    update_param_table(calculated_param_name[i]);
    update_param_slider(calculated_param_name[i]);
  }
}