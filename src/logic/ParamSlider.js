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
	this.param = param;

	// Dynamically create slider
	var wrapper = $("#sliders");
	wrapper.append(
		$("<div>")
			.attr("id", param_name + "_slider_wrapper")
			.css("margin", "0 auto")
			.css("width", "800px")
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
				.css("width", "700px"))
			.append($("<div>")
				.attr("id", "slider_" + param_name)
				.css("width", "800px"))
			.append($("<p>")));

	var value = this.param.value;
	var min = this.param.min;
	var max = this.param.max;

	this.param.scale = slide_scale(min, max);
	this.param.inverse_scale = slide_scale_inverse(min, max);

	var me = this;

	$("#slider_" + this.getFormattedName()).slider({
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
	$("#" + this.getFormattedName() + "_amount").val(this.param.value + " " + this.param.units);
}

ParamSlider.prototype = {
	slide: function(event, ui) {
		var local = this.param.inverse_scale(+ui.value);

		$("#"+this.getFormattedName()+"_amount").val(local + " " + this.param.units);

		var model = new GalacticModel();

		switch(this.param_name) {
			case "r0":
				PARAMS["r0"] = local;				
				VDATA.VROT_DARK = model.v_dark();

				update_line(".VROT_DARK", VDATA.VROT_DARK);
				update_total_velocities();
				break;
			case "sigma0":
				PARAMS["sigma0"] = local;
				VDATA.VROT_DARK = model.v_dark();

				update_line(".VROT_DARK", VDATA.VROT_DARK);
				update_total_velocities();
				break;
			case "N*":
				if(typeof PARAMS["N*"] != undefined)
					PARAMS["prev_N*"] = PARAMS["N*"];
				else
					PARAMS["prev_N*"] = PARAMS["_N*"];

				PARAMS["N*"] = local;

				VDATA.BULGE = new Bulge(VDATA.Rkpc, bulge_b, bulge_t);				
				VDATA.VROT_GR = model.v_gr();

				for(var i=0;i<VDATA.VROT_GR.length;i++){
					VDATA.VROT_GR[i] = 
						Math.sqrt(VDATA.VROT_GR[i]*VDATA.VROT_GR[i] + VDATA.BULGE[i]);
				}

				update_line(".VROT_GR", VDATA.VROT_GR);
				update_total_velocities();

				// VDATA.VROT_CONFORMAL = get_line_data(".VROT_CONFORMAL");
				VDATA.VROT_CONFORMAL = model.v_conformal();

				update_line(".VROT_CONFORMAL", VDATA.VROT_CONFORMAL);
				break;
			default:
				break;
		}
	},
	getFormattedName: function() {
		return formatName(this.param_name);
	}
};

function formatName(name) {
	return name.replace("*", "\\\*");
}

function update_total_velocities() {
	VDATA.VROT_TOTAL = Array(VDATA.VROT_GR.length);

	for(var i=0;i<VDATA.VROT_GR.length;i++) {
		VDATA.VROT_TOTAL[i] = Math.sqrt(VDATA.VROT_GR[i]*VDATA.VROT_GR[i] + VDATA.VROT_DARK[i]*VDATA.VROT_DARK[i]);
	}

	update_line(".VROT_TOTAL", VDATA.VROT_TOTAL);
}

function update_original(key) {
	if(PARAMS[key] !== undefined){
		var original_value = PARAMS.getOriginal(key).value;
		var scaled_value = PARAMS.get(key).scale(original_value);
		var units = PARAMS.get(key).units;
		
		key = formatName(key);

		var slider_name = "#slider_" + key;
		$slider = $(slider_name);
		$slider.slider("value", scaled_value);
		$slider.trigger("change");

		$("#"+ key + "_amount").val(original_value + " " + units);
	}
}

function initialize_sliders() {
	// Create initial sliders
	slider_map = {
		"N*":{min:0.01*Math.pow(10,10), max:4.0*Math.pow(10,11)},
		"r0":{min:0, max:100},
		"sigma0":{min:1.0*Math.pow(10,-10), max:1.0*Math.pow(10,-6)}
	};

	slider_keys = Object.keys(slider_map);


    for(var i=0;i<slider_keys.length;i++){
    	var key = slider_keys[i];
    	var range = slider_map[key];

    	PARAMS.setRange(key, range.min, range.max);

    	var param = PARAMS.get(key);
   		var slider = new ParamSlider(key, param);
    }
}