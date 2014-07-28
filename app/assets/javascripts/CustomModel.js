// CustomModel.js
var CUSTOM_PRE = "CUSTOM-";

$(document).ready(function() {
	$("#add_model").button().click(
		add_model);

	var dialog_id = "custom_model_list_dialog";
	var remove_func = {
		Remove: function() {
        	remove_model_from_list();
			$(this).dialog("close");
        }
      }
	create_dialog(dialog_id, remove_func);

	$("#remove_model").button().click(function() {
		var custom_models = get_custom_models();

		update_list_dialog(dialog_id, custom_models, "No custom models available");
		fire_dialog(dialog_id);

	});		
});

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

	window.location.reload();
}

function remove_model(model_name) {
	delete GMODEL[model_name];

	delete localStorage[CUSTOM_PRE + model_name];
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

function remove_model_from_list() {
	$(".ui-selected").each(function() {
		var text = $(this).text();

		remove_model(text);
	});

	window.location.reload();
}