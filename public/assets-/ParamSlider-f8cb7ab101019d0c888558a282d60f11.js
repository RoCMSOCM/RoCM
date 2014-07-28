/*

	ParamSlider

	Input: parameter name and Param Object
	
*/


function slide_scale(min, max) {
	return d3.scale.linear()
		.domain([min,max])
		.range([1,10000]);
}

function slide_scale_inverse(min, max) {
	return d3.scale.linear()
		.domain([1,10000])
		.range([min,max]);
}


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
				}))
			.append($("<label>")
				.attr("for", param_name + "_amount")
				.css("font-weight", "bold")
				.html(param_name + ": " ))
			.append($("<input>")
				.attr("type", "text")
				.attr("id", param_name + "_amount")
				.attr("onclick", "update_original('" + param_name + "')")
				.css("border", "0")
				.css("color", "#f6931f")
				.css("font-weight", "bold")
				.css("width", "50%"))
			.append($("<div>")
				.attr("id", "slider_" + param_name)
				.css("width", "100%"))
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

	this.param.scale = slide_scale(min, max);
	this.param.inverse_scale = slide_scale_inverse(min, max);

	var me = this;

	$("#slider_" + this.get_formatted_name()).slider({
		// orientation: "vertical",
		range: "min",
		min: me.param.scale(min),
		max: me.param.scale(max),
		value: me.param.scale(value),
		slide: function(event, ui) {
			me.slide(event, ui);
		},
		change: function(event, ui) {
			me.slide(event, ui);
		}
	});

	$("#" + this.get_formatted_name() + "_amount").val(formatExponential(this.param.value) + " " + this.param.units);
	update_param_table(this.get_formatted_name());
}

ParamSlider.prototype = {
	slide: function(event, ui) {
		var local = this.param.inverse_scale(+ui.value);
		var param_name = this.get_formatted_name();

		$("#"+param_name+"_amount").val(formatExponential(local) + " " + this.param.units);

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

		var scale = slide_scale(param.min, param.max);
		var scaled_value = scale(original_value);

		var units = PARAMS.getParam(key).units;
		
		key = format_name(key);

		var slider_name = "#slider_" + key;
		$slider = $(slider_name);
		$slider.slider("value", scaled_value);
		$slider.trigger("change");

		$("#"+ key + "_amount").html(formatExponential(original_value) + " " + units);
	}
}

function initialize_sliders(slider_keys) {
	// Add button
	var add_button_id = "slider_add";

	$("#sliders").append($("<button/>")
		.attr("class", "slider_button")
		.attr("id", add_button_id)
		.text("+") // In case the jquery icon fails
		.on("click", function(d) {
			var param_name = "mass_hydrogen";

			if($("#" + param_name + "_slider_wrapper").length == 0)
				new ParamSlider(param_name);
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
	var scale = slide_scale(min, max);

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

function find_all_parameters(exclude_sliders) {
	exclude_sliders === undefined ? exclude_sliders = false : exclude_sliders = exclude_sliders;

	var parameters = PARAMS.getDict();

	var slider_params;
	if(exclude_sliders)
		slider_params = find_parameter_slider_names();

	var return_params = [];

	for(var param in parameters) {
		if(param[0] != "_"
			&& !param.contains("χ²") 
			&& param != "galaxy_name" 
			&& param != "galaxy_type"
			&& param != "id"
			&& param != "citation_ids_array"
			&& param != "Functions"){

			if(exclude_sliders){
				if(!slider_params.contains(param))
					return_params.push(param);
			}
			else
				return_params.push(param);
		}
	}

	return return_params;
}


// List of parameters dialog menu.
// Activates when user clicks the + button in the Parameter Fitting Sliders section
function create_parameter_list_dialog() {

	$("#rocm_wrapper").append(
		$("<div/>")
			.attr("id", "param_list_dialog")
			.attr("title", "Parameters")
	);

	$("#param_list_dialog").dialog({
      modal: true,
      buttons: {
        Add: function() {

          $(this).dialog("close");
        }
      }
    });
}

function update_parameter_list_dialog() {
	var parameters = find_all_parameters(true);

	$("#param_list_dialog").empty();

	var list = $("#param_list_dialog").append(
		$("<ol/>")
			.attr("id", "param_list"));

	for(var i=0;i<parameters.length;i++){
		list.append($("<li/>")
			.attr("class", "ui-widget-content")
			.text(parameters[i]));
	}

	$("#param_list").selectable();
}

function fire_parameter_list_dialog() {
	$("#param_list_dialog").dialog();
}

/*
<ol id="selectable">
  <li class="ui-widget-content">Item 1</li>
  <li class="ui-widget-content">Item 2</li>
  <li class="ui-widget-content">Item 3</li>
  <li class="ui-widget-content">Item 4</li>
  <li class="ui-widget-content">Item 5</li>
  <li class="ui-widget-content">Item 6</li>
  <li class="ui-widget-content">Item 7</li>
</ol>


<div id="dialog-message" title="Download complete">
  <p>
    <span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>
    Your files have downloaded successfully into the My Downloads folder.
  </p>
  <p>
    Currently using <b>36% of your storage space</b>.
  </p>
</div>

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
*/
;
