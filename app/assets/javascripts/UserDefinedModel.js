// CustomModel.js
CUSTOM_PRE = "CUSTOM-";

$(document).ready(function() {
	$("#add_model").click(
		add_model);

	var dialog_id = "custom_model_list_dialog";
	var remove_func = {
		Remove: function() {
        	remove_model_from_list(dialog_id);
			$(this).dialog("close");
        }
      }
	create_dialog(dialog_id, "Remove Custom Model", remove_func);

	$("#remove_model").click(function() {
		var custom_models = get_custom_models();

		update_list_dialog(dialog_id, custom_models, "No custom models available");
		fire_dialog(dialog_id);

	});		

	$("#model_full_name").removeClass("dynamic_field");

	code_mirror_factory();
});

function code_mirror_factory() {
	var fnc_string = "function CUSTOM(R) {\n  // General Relativity \n  var R0 = PARAMS.get(\"scale_length\");\n  var R0km = CONVERT.kpc_to_km(R0);\n  var Rkm = CONVERT.kpc_to_km(R);\n\n  var x = (Rkm/(2*R0km));\n  var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));\n\n  var c = CONST.get(\"speed_of_light\");\n  var B = CONST.get(\"schwarzschild_radius\");\n\n  var mass = PARAMS.get(\"mass_disk\");\n  var solar_mass = CONST.get(\"solar_mass\");\n\n  var Nstar = mass/solar_mass;\n\n  var bulge = BULGE(R);\n\n  var rotation_velocity = Math.sqrt(Rkm * (((Nstar*B*c*c*Rkm)/(2*R0km*R0km*R0km)) * bessel_func));\n\n  rotation_velocity = Math.sqrt(rotation_velocity*rotation_velocity + bulge);\n  \n  return rotation_velocity;\n}";
	var code_mirror_div_id = "model_input";
	create_code_mirror(fnc_string, code_mirror_div_id);


	var ex_string = "function MODELNAME(R) {\n    // Input: R in kpc\n    // Output: rotation_velocity in km/s\n    // Available objects/functions: PARAMS, CONST, CONVERT, GMODEL, BULGE\n    \n    var rotation_velocity;\n\n\n    return rotation_velocity;\n}";
	var code_mirror_ex_div_id = "model_input_example";
	create_code_mirror(ex_string, code_mirror_ex_div_id);
}

function create_code_mirror(str, id) {
	var codeMirror = CodeMirror(document.getElementById(id), {
	  value: str,
	  mode:  "javascript"
	});

	codeMirror.setSize("100%");
}

function add_model() {
	var regex = new RegExp("^function \\w*\\(\\w*\\)\\s*$");

	var text = $("#model_input").val();

	var split = text.split("{");
	var match = regex.exec(split[0]);

	if(match == null){
		alert("Write custom model in the form:\n\nfunction MODELNAME(R) {\n\n}")
		return;
	}

	var model_name = split[0].replace("function", "").split("(")[0].trim();

	var input_regex = new RegExp("\\(\\w*\\)");
	var input_match = input_regex.exec(split[0]);
	var input = input_match[0].replace("(", "").replace(")", "");
	
	var func_body = text.split("{")[1];
	func_body = func_body.split("}")[0];

	var custom_model;

	// JavaScript error
	try {
		custom_model = new Function(input, func_body);
	}
	catch(err) {
		alert(err.message + "\n----\nPlease fix your custom model.")
		return;
	}

	// Syntax error
	try {
	    custom_model(10);
	}
	catch(err) {
	    alert(err.message + "\n----\nPlease fix your custom model.");
	    return;
	}

	// Checking if key in PARAMS.get(key) was initialized.	
	var uninitialized_param = PARAMS.getUninitialized();
	var u_length = uninitialized_param.length;
    if(u_length > 0){
    	var s = u_length == 1 ? "" : "s";
    	alert("Uninitialized PARAMS value"+ s +" for '"+ uninitialized_param +"'.\n\nAdd the '"+ uninitialized_param +"' parameter"+ s +" via the 'Add new parameter' button.");
    	PARAMS.resetUninitialized();
    	return;
    }

	GMODEL[model_name] = custom_model;
	localStorage.setItem(CUSTOM_PRE + model_name, func_body);

	var full_name = $("#model_full_name").val();
	if(full_name == "")
		full_name = model_name;

	var model_color = $("#model_color").val();


	var model_style = new GalacticModelStyle(model_name, full_name, model_color);
	STYLE.add(model_name, model_style);
	localStorage.setItem("STYLE_dictionary", JSON.stringify(STYLE.getDict()));

	localStorage.setItem("model_input", text);
	localStorage.setItem("model_color", model_color);
	localStorage.setItem("model_full_name", full_name);


	var chi_name = model_name + "_" + chi_squared_string;
	if($("#" + chi_name + "_param_header").length == 0){
	    PARAMS.initialize(chi_name, 0);
		add_param_to_table("chi_table", chi_name, PARAMS.get(chi_name));
	}

	update_models();
}

function remove_model(model_name) {
	delete GMODEL[model_name];

	delete localStorage[CUSTOM_PRE + model_name];

	var chi_name = model_name + "_" + chi_squared_string;
	remove_param_from_table("chi_table", chi_name);

	return true;
}

function get_custom_models() {
	var custom_models = [];
	var local_keys = Object.keys(localStorage);

	for(var i=0;i<local_keys.length;i++) {
		var key = local_keys[i];
		if(key.contains(CUSTOM_PRE)){
			var custom_model = key.replace(CUSTOM_PRE, "");

			custom_models.push(custom_model);
		}
	}

	return custom_models;
}

function remove_model_from_list(dialog_id) {
	$("li.ui-selected." + dialog_id + "_item").each(function() {
		var text = $(this).text();

		if(remove_model(text)){
			var legend = d3.select("#legend_VROT_" + text);
			var data = legend.data();
			remove_legend_element(data[0]);
		}
	});
}