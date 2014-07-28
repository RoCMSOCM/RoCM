// Parameter Formatting Global Map
var FORMATTED_MAP;

$(document).ready(function(){
	var stored_format_map = localStorage.getItem("FORMATTED_MAP");

	if(stored_format_map != null)
		FORMATTED_MAP = JSON.parse(stored_format_map);
	else{
		FORMATTED_MAP = {
			galaxy_name: "Galaxy",
			galaxy_type: "Type", 
			distance: "Distance <br> (Mpc)",
			luminosity: "L<sub>B</sub> <br> (10<sup>10</sup> L<sub>☉</sub> W)",
			scale_length: "R<sub>0</sub> <br> (kpc)",
			mass_hydrogen: "M<sub>HI</sub> <br> (10<sup>10</sup> M<sub>☉</sub> kg)",
			mass_disk: "M<sub>disk</sub> <br> (10<sup>10</sup> M<sub>☉</sub> kg)",
			mass_light_ratio: "(M/L)<sub>stars</sub> <br> (M<sub>☉</sub>/L<sub>☉</sub> kg/W)",
			r_last: "R<sub>last</sub> <br> (kpc)",
			universal_constant: "(v<sup>2</sup>/c<sup>2</sup>R)<sub>last</sub> <br> (10<sup>-30</sup> cm<sup>-1</sup>)",
			velocities_count: "Number of <br> Observed Points",
			citation_ids_array: "Citations",
			vrot_data_last: "V<sub>last</sub> <br> (km/s)"
		};
	}
});


function get_formatted_parameter(param_name) {
   var column_name = FORMATTED_MAP[param_name];
   if(column_name === undefined)
      column_name = param_name;

   return column_name;
}

function get_both_parameter_formats(param_name) {
	var formatted_param = get_formatted_parameter(param_name).replace("<br>", "");
	var param = param_name;

	if(formatted_param == param){
		param = formatted_param;
		formatted_param = "";
	}
	else
		formatted_param = ": " + formatted_param;

	var html_param = "<b>" + param + "</b>" + formatted_param;

	return html_param;
}

function add_param(param_name, param_full_name, param) {
	var units = param.units != "" ? "(" + param.units + ")" : param.units;

	var fname = param_full_name + " <br> " + units;

	FORMATTED_MAP[param_name] = fname;

	
	if(typeof(param) != "object")
		PARAMS.add(param_name, new Param(param));
	else
		PARAMS.add(param_name, param);

	localStorage.setItem("FORMATTED_MAP", JSON.stringify(FORMATTED_MAP));
}


function display_formatted_map() {
	// var arrow = "→";
	var parameter_map = "";

	for(var formatted_name in FORMATTED_MAP) {
		parameter_map += get_both_parameter_formats(formatted_name) + "<br>";
	}

	$("#user_defined_model_text").html(parameter_map);
}
;
