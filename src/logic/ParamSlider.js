function ParamSlider(var_name, min, max, num, coeff, units) {
	this.var_name = var_name;
	this.min = +min;
	this.max = +max;
	this.num = +num;
	this.coeff = +coeff;
	this.units = units;

	var me = this;

	$("#slider_" + this.getName()).slider({
		range: "min",
		min: me.min/me.coeff,
		max: me.max/me.coeff,
		value: me.num/me.coeff,
		slide: function(event, ui) {
			me.slide(event, ui);
		},
		change: function(event, ui) {
			me.slide(event, ui);
		}
	});
	$("#" + this.getName() + "_amount").val(this.num + " " + this.units);
}

ParamSlider.prototype = {
	slide: function(event, ui) {
		var local = +ui.value*this.coeff;

		$("#"+this.getName()+"_amount").val(local + " " + this.units);

		var model = new GalacticModel();

		switch(this.var_name) {
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
	getName: function() {
		return this.var_name.replace("*", "\\\*");
	}
};

function initialize_sliders() {
	// ParamSlider(var_name, min, max, num, coeff, units)
	var r0_min = 0.25;
	var r0_max = 100.0;
	var r0_num = PARAMS["r0"];
	var r0_coeff = 1/100;
	var r0_slider = new ParamSlider("r0", r0_min, r0_max, r0_num, r0_coeff, "kpc");

	var sigma0_min = 1.0*Math.pow(10,-10);
	var sigma0_max = 1.0*Math.pow(10,-6);
	var sigma0_num = PARAMS["sigma0"];
	var sigma0_coeff = sigma0_min;
	var sigma0_slider = new ParamSlider("sigma0", sigma0_min, sigma0_max, sigma0_num, sigma0_coeff, "GeV cm^-3");

	var Nstar_min = 0.01*Math.pow(10,10);
	var Nstar_max = 4.0*Math.pow(10,11);
	var Nstar_num = PARAMS["N*"];
	var Nstar_coeff = Nstar_min; 
	var Nstar_slider = new ParamSlider("N*", Nstar_min, Nstar_max, Nstar_num, Nstar_coeff, "stars");
}

function update_total_velocities() {
	VDATA.VROT_TOTAL = Array(VDATA.VROT_GR.length);

	for(var i=0;i<VDATA.VROT_GR.length;i++) {
		VDATA.VROT_TOTAL[i] = Math.sqrt(VDATA.VROT_GR[i]*VDATA.VROT_GR[i] + VDATA.VROT_DARK[i]*VDATA.VROT_DARK[i]);
	}

	update_line(".VROT_TOTAL", VDATA.VROT_TOTAL);
}

function update_original(type) {
	// var orig_val = 0;
	// var coeff = 0;
	// var val_suffix = "";

	// if(type == "N*"){
	// 	coeff = Nstar_coeff;
	// 	orig_val = PARAMS["_N*/coeff"];
	// 	val_suffix = " stars";
	// }
	// else if(type == "r0"){
	// 	coeff = 1/r0_coeff;
	// 	orig_val = PARAMS["_r0/coeff"];
	// 	val_suffix = " kpc";
	// }
	// else if(type == "sigma0"){
	// 	coeff = sigma0_coeff;
	// 	orig_val = PARAMS["_sigma0/coeff"];
	// 	val_suffix = "GeV cm^-3";
	// }

	// var slider_name = "#slider_" + type;

	// // $("#"+ type + "_amount").val( orig_val*coeff + val_suffix );

	// $slider = $(slider_name);
	// $slider.slider("value", orig_val);
	// $slider.trigger("change");

}