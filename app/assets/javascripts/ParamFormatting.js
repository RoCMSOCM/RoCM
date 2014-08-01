// Parameter Formatting Global Map
var FORMATTED_MAP;

$(document).ready(function(){
	var stored_formatted_map = localStorage.getItem("FORMATTED_MAP");

	if(stored_formatted_map != null)
		FORMATTED_MAP = JSON.parse(stored_formatted_map);
	else {
		FORMATTED_MAP = {
			galaxy_name: {
				name: "Galaxy"
			},
			galaxy_type: {
				name: "Type"
			}, 
			distance: {
				name: "Distance",
				units: "Mpc"
			},
			luminosity: {
				name: "L<sub>B</sub>",
				units: "10<sup>10</sup> L<sub>☉</sub> W",
				multiplier: Math.pow(10,10) * CONST.get("solar_luminosity")
			},
			scale_length: {
				name: "R<sub>0</sub>",
				units: "kpc"
			},
			mass_hydrogen: {
				name: "M<sub>HI</sub>",
				units: "10<sup>10</sup> M<sub>☉</sub> kg",				
				multiplier: Math.pow(10,10) * CONST.get("solar_mass")
			},
			mass_disk: {
				name: "M<sub>disk</sub>", 
				units: "10<sup>10</sup> M<sub>☉</sub> kg",				
				multiplier: Math.pow(10,10) * CONST.get("solar_mass")
			},
			mass_light_ratio: {
				name: "(M/L)<sub>stars</sub>",
				units: "M<sub>☉</sub>/L<sub>☉</sub> kg/W"
			},
			r_last: {
				name: "R<sub>last</sub>",
				units: "kpc"
			},
			universal_constant: {
				name: "(v<sup>2</sup>/c<sup>2</sup>R)<sub>last</sub>",
				units: "10<sup>-30</sup> cm<sup>-1</sup>",
				multiplier: Math.pow(10,-30)
			},
			velocities_count: {
				name: "Number of <br> Observed Points"
			},
			citation_ids_array: 
			{
				name: "Citations"
			},
			vrot_data_last: {
				name: "V<sub>last</sub>",
				units: "km/s"
			}
		};
	}

	var add_func = {Add: function() {
			add_param_from_inputs();
			$(this).dialog("close");
		}
	};

	var dialog_id = "add_parameter_dialog";
	create_dialog(dialog_id, "Add parameter to PARAMS", add_func);
	create_parameter_input_fields(dialog_id);

	$("#add_parameter").button().click(function(){
		fire_dialog("add_parameter_dialog");
	});
});


function get_formatted_parameter(param_name, include_units, include_breaks) {
	include_units = include_units === undefined ? false : include_units;
	include_breaks = include_breaks === undefined ? false : include_breaks;
	var fparam = FORMATTED_MAP[param_name];
	if(fparam === undefined)
		fparam = param_name;
	else if(fparam.units !== undefined && include_units){
		var br = include_breaks ? "<br>" : "";
		var units = fparam.units == "" ? "" : " (" + fparam.units + ")";

		fparam = fparam.name + br + units;
	}
	else
		fparam = fparam.name;

	return fparam;
}

function get_both_parameter_formats(param_name, include_units, include_breaks) {
	var formatted_param = get_formatted_parameter(param_name, include_units, include_breaks);

	var param = param_name;

	if(formatted_param == param){
		param = formatted_param;
		formatted_param = "";
	}
	else
		formatted_param = " (" + formatted_param + ") ";

	var html_param = "<b>" + param + "</b>" + formatted_param;

	return html_param;
}

function display_formatted_map() {
	// var arrow = "→";
	var parameter_map = "";

	for(var formatted_name in FORMATTED_MAP) {
		parameter_map += get_both_parameter_formats(formatted_name, true, false).replace("<br>","") + "<br>";
	}

	$("#user_defined_model_text").html(parameter_map);
}

// <input> id's: Used to input a new parameter
var param_name_id = "param_name_input";	
var param_long_name_id = "param_long_name_input";
var param_units_id = "param_units_input";
var param_value_id = "param_value_input";
var param_min_id = "param_min_input";
var param_max_id = "param_max_input";

function create_parameter_input_fields(dialog_id){
	var dialog = $("#" + dialog_id);

	dialog.empty();

	var param_name_label = "Parameter short name";
	var param_long_name_label = "Parameter formatted name (use HTML formatting)";
	var param_units_label = "Units (use HTML formatting)";
	var param_value_label = "Value";
	var param_min_label = "Minimum";
	var param_max_label = "Maximum";

	add_input_with_label(param_name_id, dialog, param_name_label, false);
	add_input_with_label(param_long_name_id, dialog, param_long_name_label, false);
	add_input_with_label(param_units_id, dialog, param_units_label, false);
	add_input_with_label(param_value_id, dialog, param_value_label, true);
	add_input_with_label(param_min_id, dialog, param_min_label, true);
	add_input_with_label(param_max_id, dialog, param_max_label, true);
	
}

function add_input_with_label(input_id, div, html_text, is_number) {
	var label = $("<label>")
		.attr("for", input_id)
		.html("<b>" + html_text + "</b>:");

	var input = $("<input>")
		.attr("id", input_id)
		.attr("type", "text")
		.css("min-width", "95%");

	if(is_number){
		input.keypress(function(e) {
            handle_input_keypress(this, e);
        });
	}

	div.append(label);
	div.append(input);
}

function add_param_from_inputs(){
	var param_name = $("#" + param_name_id).val();
	var param_long_name = $("#" + param_long_name_id).val();
	var param_units = $("#" + param_units_id).val();
	var param_value = $("#" + param_value_id).val();
	var param_min = $("#" + param_min_id).val();
	var param_max = $("#" + param_max_id).val();

	//TODO: var param_multiplier = 1;

	if(param_name.length == 0 || param_long_name.length == 0 || param_value.length == 0 || param_min.length == 0 || param_max.length == 0)
		alert("Please fill every parameter input.");
	else{
		add_param(param_name, param_long_name, new Param(+param_value, param_units, 1, +param_min, +param_max));
	}


}