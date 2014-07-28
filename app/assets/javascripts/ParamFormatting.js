// Parameter Formatting Global Map
var FORMATTED_MAP;

$(document).ready(function(){
	var stored_formatted_map = localStorage.getItem("FORMATTED_MAP");

	if(stored_formatted_map != null)
		FORMATTED_MAP = JSON.parse(stored_formatted_map);
	else {
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

	if(param_name.length == 0 || param_long_name.length == 0 || param_value.length == 0 || param_min.length == 0 || param_max.length == 0)
		alert("Please fill every parameter input.");
	else{
		add_param(param_name, param_long_name, new Param(+param_value, param_units, +param_min, +param_max));
	}


}