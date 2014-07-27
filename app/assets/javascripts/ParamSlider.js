/*

	ParamSlider

	Input: parameter name and Param Object
	
*/
function ParamSlider(param_name, param) {
	this.param_name = param_name;
	if(param == undefined){
		if(PARAMS.getParam(param_name) !== undefined){
			param = PARAMS.getParam(param_name);
		}
		else {
			params = new Params()
			PARAMS.initialize(param_name, params);
			PARAMS.update_localStorage();
		}
	}

	this.param = param;

	// Dynamically create slider
	var sliders_width = 700; // px

	var wrapper = $("#sliders")
					.css("width", sliders_width + "px");

	var minus_button_id = "slider_" + param_name + "_remove";

	wrapper.append(
		$("<div>")
			.attr("id", param_name + "_slider_wrapper")
			.attr("class", "slider_wrapper")
			.css("margin", "0 auto")
			.css("float", "right")
			.css("width", "100%")
			.append($("<button>")
				.attr("id", minus_button_id)
				.attr("class", "slider_button")
				.text("-") // In case the jquery icon fails
				.on("click", function(d) {
					remove_slider(param_name);
					update_slider_configuration();
				}))
			.append($("<label>")
				.attr("for", param_name + "_amount")
				.css("background-color", "white")
				.html(get_both_parameter_formats(param_name) + " = " )
				.on("click", function() {
		            update_original(param_name);
		        }))
			.append($("<input>")
				.attr("type", "text")
				.attr("id", param_name + "_amount")
				.css("border", "0")
				.css("opacity", "1")
				.css("color", "#f6931f")
				.css("font-weight", "bold")
				.keyup(resizeInput)
				.keypress(function(e) {
	                handle_input_keypress(this, e, param_name);
	            }))
			.append($("<div>")
				.attr("id", "slider_" + param_name)
				.css("width", "100%")
				.css("opacity", 0.8))
			.append($("<p>")));

	$("#" + minus_button_id).button({
      icons: {
        primary: "ui-icon-minus"
      },
      text: false
    });

	var value = this.param.value;
	var min = this.param.min;
	var max = this.param.max;

	var me = this;

	$("#slider_" + this.get_formatted_name()).slider({
		// orientation: "vertical",
		range: "min",
		step: 0.00001,
		min: min,
		max: max,
		value: value,
		slide: function(event, ui) {
			me.slide(event, ui);
		},
		change: function(event, ui) {
			me.slide(event, ui);
		}
	});

	$("#" + this.get_formatted_name() + "_amount").val(formatExponential(this.param.value));
	update_param_table(this.get_formatted_name());


	$('input[type="text"]')
	    .keyup(resizeInput)
	    .each(resizeInput);

}

ParamSlider.prototype = {
	slide: function(event, ui) {
		var local = +ui.value;
		var param_name = this.get_formatted_name();

		$("#"+param_name+"_amount").val(formatExponential(local));

		$("#"+param_name+"_amount")
		    .keyup(resizeInput)
		    .each(resizeInput);

		PARAMS.setValue(this.param_name, local);

		update_models(this.param_name);


		
	},
	get_formatted_name: function() {
		return format_name(this.param_name);
	}
};

function update_models(param_name) {
	var data_size = VDATA.VROT_DATA.length;

	PARAMS.setFindUsedParams(true);
	for(var model in GMODEL) {
		PARAMS.resetUsed();
		// Test model equation to find out which PARAMS are used.
		var test = GMODEL[model](1);

		if(param_name === undefined || PARAMS.used.contains(param_name)) {
			VDATA["VROT_" + model] = new Array(data_size);
			for(var i = 0; i < data_size; i++){
				var vrot_value = GMODEL[model](VDATA.R[i]);
				if(isNaN(vrot_value))
					VDATA["VROT_" + model][i] = 0;
				else
					VDATA["VROT_" + model][i] = vrot_value;
			}

			update_line(".VROT_"+model, VDATA["VROT_" + model]);
		}
	}
	PARAMS.setFindUsedParams(false);
	PARAMS.resetUsed();

	// TODO: Change where to update bar chart
	// update_bar();
	update_chi_squared();
	update_param_table(param_name);
}

function format_name(name) {
	return name.replace("*", "\\\*");
}

function update_original(key) {
	if(PARAMS.get(key) !== undefined){
		var param = PARAMS.getParam(key);
		var original_value = PARAMS.get("_"+key);
		
		key = format_name(key);

		var slider_name = "#slider_" + key;
		$slider = $(slider_name);
		$slider.slider("value", original_value);
		$slider.trigger("change");

		$("#"+ key + "_amount").html(formatExponential(original_value));
		$("#"+ key + "_param_value").val(formatExponential(original_value));
	}
}

function initialize_sliders(slider_keys) {
	// Add button
	var add_button_id = "slider_add";

	$("#sliders").append($("<button/>")
		.attr("class", "slider_button")
		.attr("id", add_button_id)
		.text("+") // In case the jquery icon fails
		.on("click", function() {
			update_parameter_list_dialog();
			fire_parameter_list_dialog();
		}));

	$("#" + add_button_id).button({
      icons: {
        primary: "ui-icon-plus"
      },
      text: false
    });

	// Reset button
	var reset_button_id = "slider_reset";

    $("#sliders").append($("<button/>")
		.attr("class", "reset_button")
		.attr("id", reset_button_id)
		.css("font-size",".8em")
		.text("Reset") 
		.on("click", function(d) {
			update_parameter_sliders(true);
		}));

	$("#" + reset_button_id).button();
	

	// Title
	$("#sliders").append($("<h2/>")
		.html("Parameter Fitting Sliders"));
	
	// Bulge toggle label
	$("#sliders").append($("<label/>")
		.attr("id", "bulge_toggle_label")
		.html("<b>Bulge</b>"));

	// Bulge toggle
	$("#sliders").append($("<input/>")
		.attr("type", "checkbox")
		.attr("id", "bulge_toggle"));

	// Default to GLOBAL_BULGE
    $("#bulge_toggle").prop('checked', GLOBAL_BULGE);

	$("#bulge_toggle").change(function() {
        GLOBAL_BULGE = $(this).is(":checked");
        update_models("bulge_b");
    });


	// Create initial sliders
    for(var i=0;i<slider_keys.length;i++){
    	var key = slider_keys[i];

    	var param = PARAMS.getParam(key);
   		var slider = new ParamSlider(key, param);
    }
}

function remove_slider(param_name) {
	$("#" + format_name(param_name) +"_slider_wrapper").remove();
}

// TODO:
function set_slider_range(param_name, min, max) {
	var slider = $("#slider_" + format_name(param_name));

	slider.slider("option", "min", min*100);
	slider.slider("option", "max", max*100);

	slider.slider("option", "value", slider.slider("option", "value"));

}

function update_parameter_sliders(is_original_value) {
	var sliders = find_parameter_sliders();
	var removed = sliders.remove();

	for(var i=0; i<removed.length; i++){
		var param_name = removed[i].id.replace("_slider_wrapper", "");
		new ParamSlider(param_name);

		var galaxy_name = PARAMS.get("galaxy_name");
		// First check if the param is within SOCM 
		// (meaning the default should be reset if the galaxy doesn't have the observed parameter)
		// Ex: dark_matter_density, bulge_b
		if(SOCMPARAMS[galaxy_name][param_name] === undefined || (is_original_value !== undefined && is_original_value)){
			update_original(param_name);
		}
	}
}

function find_parameter_sliders() {
	return $("#sliders").find(".slider_wrapper");
}

function find_parameter_slider_names() {
	var sliders = find_parameter_sliders();
	var param_names = [];

	for(var i=0; i<sliders.length; i++){
		var param_name = sliders[i].id.replace("_slider_wrapper", "");
		param_names.push(param_name);
	}

	return param_names;
}

function update_slider_configuration() {
	var slider_parameters = find_parameter_slider_names();

	localStorage.setItem("slider_configuration", JSON.stringify(slider_parameters));
}

function get_slider_configuration() {
	var slider_parameters = localStorage.getItem("slider_configuration");

	if(slider_parameters != null){
		slider_parameters = JSON.parse(slider_parameters);
	}
	return slider_parameters;
}

function resizeInput() {
	var len = $(this).val().length;
    $(this).attr('size', len - 2);
}

function handle_input_keypress(input, e, param_name) {
	var value = $(input).val();
	var keyCode = e.keyCode;
	var input_value = String.fromCharCode(keyCode);

	if(isNaN(value + input_value))
	    e.preventDefault();
	else if(keyCode === 13){
		PARAMS.setValue(param_name, +(value + input_value));

		update_models(param_name);
	}
}