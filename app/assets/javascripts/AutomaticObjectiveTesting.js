// Automatic Objective Testing (AOT)

function AutomaticObjectiveTesting() {
	var model = $("[name=objective_model]:checked");

	if(model.length == 0){
		alert("Please select a model.")
		return;
	}

	var model_name = model.attr("id").replace("_objective", "");


	var parameter = $("[name=free_parameter]:checked");

	if(parameter.length == 0){
		alert("Please select a free parameter.")
		return;
	}
	else if(parameter.length > 5){
		alert("Number of free parameters is too high.");
		return;
	}

	var parameter_names = [];
	var param = [];
	var min = [];
	var max = [];

	for(var i=0; i<parameter.length; i++){
		parameter_names.push($(parameter[i]).attr("id").replace("_free_parameter", ""));
		param.push(PARAMS.getParam(parameter_names[i]));
		min.push(param[i].min);
		max.push(param[i].max);
	}

	// TODO: Check if the model uses the parameter...

	// TODO: Update slider at the end with the optimal parameter
	// var slider = $("#slider_" + format_name(parameter_name[0]));

	// var chi = Infinity;
	// var optimal_parameter = null;
	// var obs = VDATA.VROT_DATA;
	// var obs_err = VDATA.VROT_DATA_ERROR;
	// var R = VDATA.R;

	// var s = parameter_names.length == 0 ? "" : "s";
	//alert("Objective: " + model_name + "\nFree parameter" + s + ": " + parameter_names);
	
	var number_of_steps = 100;
	var step_interval = (max[0] - min[0]) / number_of_steps;
	// console.log("Number of steps = ", number_of_steps, " Step intervals of " + step_interval);


	var vrot = GMODEL[model_name];

	// TODO: Time the parallel call
	// var time0 = Date.now()


	// Test the vrot function to see what parameters are used.
	PARAMS.setFindUsedParams(true);
	var test = vrot(10);
	var paramsUsed = PARAMS.used;
	var constUsed = CONST.used;
	PARAMS.setFindUsedParams(false);

	// Gets the dictionary of PARAMS
	var paramsDict = PARAMS.getDict();

	// Maps the used parameters number value to paramsNum
	var paramsNum = paramsUsed.map(function(d){
		return paramsDict[d].value * paramsDict[d].multiplier;
	});

	// Combines the used key with the used number (value * multiplier)
	var passableParamsDict = _.object(paramsUsed, paramsNum)

	
	// Maps the used constants number value to constNum
	var constNum = constUsed.map(function(d){
		return CONST.get(d);
	});

	var passableConstDict = _.object(constUsed, constNum);

	// TODO: GMODEL within models
	// RegEx for TOTAL = this.GR(R); this.DARK(R); 

	var regex_PARAMS = /PARAMS.get\(\"\b(\w*)\b\"\)/g;
	var regex_CONST = /CONST.get\(\"\b(\w*)\b\"\)/g;
	var regex_BULGE = /BULGE\(\b(\w*)\b\)/g;

	var replacement_PARAMS = "pPARAMS[\"$1\"]";
	var replacement_CONST = "pCONST[\"$1\"]";
	var replacement_BULGE = "pBULGE($1, pPARAMS, LOCAL_BULGE, true)"; // IS_PARALLEL for bulge caching

	var vrot_fnc_str = vrot.toString();
	var vrot_body = vrot_fnc_str.slice(vrot_fnc_str.indexOf("{") + 1, vrot_fnc_str.lastIndexOf("}"));
	var bulge_fnc_str = BULGE.toString();
	var bulge_body = bulge_fnc_str.slice(bulge_fnc_str.indexOf("{") + 1, bulge_fnc_str.lastIndexOf("}"));


	// Convert the vrot function to allow for parallelization
	// (Namely the PARAMS, CONST, and BULGE have to be altered)
	var match_PARAMS = vrot_body.match(regex_PARAMS);
	
	vrot_body = vrot_body.replace(regex_PARAMS, replacement_PARAMS)
		.replace(regex_CONST, replacement_CONST)
		.replace(regex_BULGE, replacement_BULGE);

	bulge_body = bulge_body.replace(regex_PARAMS, replacement_PARAMS);


	// Create the new functions that the parallel workers can use
	var vrot_final = new Function(["R", "pPARAMS", "pCONST", "CONVERT", "LOCAL_BULGE"], vrot_body);
	var vrot_final_name = "vrot_final";
	var bulge_final = new Function(["R", "pPARAMS", "LOCAL_BULGE", "IS_PARALLEL"], bulge_body);
	var bulge_final_name = "pBULGE";


	// Configure the paralleled job and global.namespace
	parallel = new Parallel(VDATA.R, {
	  env: {
	  	PARAMS: passableParamsDict,
	  	CONST: passableConstDict,
	  	pVDATA_DATA: VDATA.VROT_DATA,
	  	pVDATA_ERR: VDATA.VROT_DATA_ERROR,
	  	pLOCAL_BULGE: GLOBAL_BULGE,
	    min: min[0],
	    max: max[0],
	    steps: step_interval,
	    number_of_steps: number_of_steps
	  },
	  evalPath: 'assets/eval.js?body=1' 
	});

	// Include the required functions and files
	parallel.require({fn: vrot_final, name: vrot_final_name});
	parallel.require({fn: bulge_final, name: bulge_final_name});
	parallel.require(chi_squared_variance);
	parallel.require(add);
	parallel.require("ParamDict.js?body=1");
	parallel.require("Bulge.js?body=1");
	parallel.require("bessel.js?body=1");
	parallel.require("integrate.js?body=1");
	parallel.require("Conversion.js?body=1");

	var callBack = function () {
		console.log("Completed.")
		console.log(arguments);
		var sum = arguments[0].reduce(add);
		console.log(sum);

		alert(chi_squared_string + " = " + formatExponential(sum).superScript() + " for " + model_name);
	};

	// For reduce call
	function add(a, b) {
	    return a + b;
	}

	parallel.spawn(function(d){
		var pPARAMS = global.env.PARAMS;
		var pCONST = global.env.CONST;
		var pCONVERT = new Conversion();
		var pLOCAL_BULGE = global.env.pLOCAL_BULGE;
		var pVDATA_DATA = global.env.pVDATA_DATA;
		var pVDATA_ERR = global.env.pVDATA_ERR;

		return d.map(function(R, index) {
			return chi_squared_variance(
				pVDATA_DATA[index], 
				vrot_final(R, pPARAMS, pCONST, pCONVERT, pLOCAL_BULGE), 
				pVDATA_ERR[index]);
		});
	}).then(callBack);



	// for(var step=min; step<=max; step+steps){
	// 	// slider.slider("value", step);
	// 	PARAMS.set(parameter_name, step);
	// 	for(var i=0;i<obs.length;i++){
	// 		var test_chi = chi_squared_variance(obs[i], exp, obs_err[i]);
	// 		if(test_chi < chi){
	// 			chi = test_chi;
	// 			optimal_parameter = i;
	// 		}	
	// 	}
	// } 


	// alert("Optimizing " + chi_squared_string + " for " + model_name + ":\n\n" + parameter_name[0] + " = " + i);
}