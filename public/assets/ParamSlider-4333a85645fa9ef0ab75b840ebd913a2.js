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
			PARAMS.add(param_name, params);
		}
	}

	this.param = param;

	// Dynamically create slider
	var sliders_width = 700; // px
	var left_offset = +($("#sliders").parent().css("width").replace("px", "")) - sliders_width*1.75;

	var wrapper = $("#sliders")
					.css("width", sliders_width + "px")
					.css("left", left_offset + "px");

	var minus_button_id = "slider_" + param_name + "_remove";

	wrapper.append(
		$("<div>")
			.attr("id", param_name + "_slider_wrapper")
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


		var data_size = VDATA.VROT_DATA.length;

		PARAMS[this.param_name] = local;

		//TODO:
		// Get the individual galaxy's parameters from SOCM.
		// (currently Milky Way csv parameters)
		for(var model in GMODEL) {
			PARAMS.resetUsed();
			// Test model equation to find out which PARAMS are used.
			var test = GMODEL[model](1);

			if(PARAMS.used.contains(this.param_name)) {
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

		// TODO: Change where to update bar chart
		// update_bar();
		update_chi_squared();
		update_param_table(this.param_name);

	},
	get_formatted_name: function() {
		return format_name(this.param_name);
	}
};

function format_name(name) {
	return name.replace("*", "\\\*");
}

function update_original(key) {
	if(PARAMS.get(key) !== undefined){
		var original_value = PARAMS.getOriginal(key).value;
		var scaled_value = PARAMS.getParam(key).scale(original_value);
		var units = PARAMS.getParam(key).units;
		
		key = format_name(key);

		var slider_name = "#slider_" + key;
		$slider = $(slider_name);
		$slider.slider("value", scaled_value);
		$slider.trigger("change");

		$("#"+ key + "_amount").html(formatExponential(original_value) + " " + units);
	}
}

function initialize_sliders(slider_map) {
	var plus_button_id = "slider_add";

	$("#sliders").append($("<button/>")
		.attr("class", "slider_button")
		.attr("id", plus_button_id)
		.text("+") // In case the jquery icon fails
		.on("click", function(d) {
			var param_name = "mass_hydrogen";

			if($("#" + param_name + "_slider_wrapper").length == 0)
				new ParamSlider(param_name);
		}));

	$("#" + plus_button_id).button({
      icons: {
        primary: "ui-icon-plus"
      },
      text: false
    });

	$("#sliders").append($("<h2/>")
		.html("Parameter Fitting Sliders"));

	$("#sliders").append($("<table/>")
		.attr("id", "chi_table")
		.css("margin", "0 auto")
		.css("cellspacing", "0"));

	// Create initial sliders
	slider_keys = Object.keys(slider_map);


    for(var i=0;i<slider_keys.length;i++){
    	var key = slider_keys[i];
    	var range = slider_map[key];

    	PARAMS.setRange(key, range.min, range.max);

    	var param = PARAMS.getParam(key);
   		var slider = new ParamSlider(key, param);
    }
}

function remove_slider(param_name) {
	$("#"+ format_name(param_name) +"_slider_wrapper").remove();
}
;
