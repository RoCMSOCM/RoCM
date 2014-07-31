/*

	ParamSlider

	Input: parameter name and Param Object
	
*/
function ParamSlider(param_name, param) {
	this.param_name = param_name;
	if(param == undefined){
		if(PARAMS.getParam(param_name) != null){
			param = PARAMS.getParam(param_name);
		}
		else {
			params = new Param()
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

	var include_units = true;
	var include_breaks = false;

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
				.html(get_both_parameter_formats(param_name, include_units, include_breaks) + " = " )
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
	if(max <= value)
		max = value * 5;

	var me = this;

	$("#slider_" + this.get_formatted_name()).slider({
		// orientation: "vertical",
		range: "min",
		step: 0.000001,
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
	var ymax = 0;

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

				if(vrot_value > ymax)
					ymax = vrot_value;
			}
			update_curve(".VROT_"+model, VDATA["VROT_" + model], VDATA.R);
		}

	}
	
	if(UPDATE_Y_AXIS){
		for(var v in VDATA) {
			var vmax = d3.max(VDATA[v]);
			if(vmax > ymax)
				ymax = vmax;
		}

		var y_updated = update_y_axis(0, ymax);

		if(y_updated){
			for(var model in GMODEL) {
				update_curve(".VROT_"+model, VDATA["VROT_" + model], VDATA.R);
			}
		}
	}

  	update_data(VDATA.R);
    update_error_bar(VDATA.R);


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
	if(PARAMS.get(key) != null){
		var param = PARAMS.getParam(key);
		var original_param = PARAMS.getOriginalParam(key);
		var original_value = original_param.value;
		var original_min = original_param.min;
		var original_max = original_param.max;

		var fkey = format_name(key);

		var slider_name = "#slider_" + fkey;

		slider = $(slider_name);

		// If there isn't a slider available, just update the models
		if(slider.length == 0) {			
			PARAMS.setValue(key, original_value);
			update_models(key);
		}
		else 
		{
			slider.slider("option", "min", original_min)				
	    	slider.slider("option", "max", original_max);
			slider.slider("option", "value", original_value);
			slider.trigger("change");
		}

		$("#"+ fkey + "_amount").html(formatExponential(original_value));
		$("#"+ fkey + "_param_value").html(formatExponential(original_value));
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
			var include_units = true;
			var include_breaks = false;
			var parameters = find_all_parameters(true);
			for(var i=0;i<parameters.length;i++){
				parameters[i] = get_both_parameter_formats(parameters[i], include_units, include_breaks);
			}

			var dialog_id = "param_list_dialog";
			update_list_dialog(dialog_id, parameters, "No parameters available");
			fire_dialog(dialog_id);
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
        localStorage.setItem("GLOBAL_BULGE", GLOBAL_BULGE);
        update_models("bulge_b");
    });


	// Y_axis updating toggle label
	$("#sliders").append($("<label/>")
		.attr("id", "y_axis_toggle_label")
		.css("float", "right")
		.html("<b>Update Y-Axis</b>"));

    // Y_axis updating toggle
	$("#sliders").append($("<input/>")
		.attr("type", "checkbox")
		.attr("id", "y_axis_toggle")
		.css("float", "right"));

	// Default to UPDATE_Y_AXIS
    $("#y_axis_toggle").prop('checked', UPDATE_Y_AXIS);

	$("#y_axis_toggle").change(function() {
        UPDATE_Y_AXIS = $(this).is(":checked");
        localStorage.setItem("UPDATE_Y_AXIS", UPDATE_Y_AXIS);
        update_models();
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

// TODO: Slider custom min and max values
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

// For slider and ParamTable input fields
function handle_input_keypress(input, e, param_name) {
	var value = $(input).val();
	var keyCode = e.keyCode;
	var input_value = String.fromCharCode(keyCode);

	if(isNaN(value + input_value))
	    e.preventDefault();
	else if(keyCode === 13 && param_name != undefined){
		var new_value = +(value + input_value)
		PARAMS.setValue(param_name, new_value);

		update_models(param_name);

		var fname = format_name(param_name);
		var slider = $("#slider_" + fname);

		var min = slider.slider("option", "min");
		var max = slider.slider("option", "max");
		// Update max slider value if the new_value exceeds the current range.
		if(new_value >= max)
	    	slider.slider("option", "max", new_value*5);
	    if(new_value <= min)
	    	slider.slider("option", "min", new_value/5)
    
    	slider.slider("option", "value", new_value);
	}
}
