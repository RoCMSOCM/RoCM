// Automatic Objective Testing

function AutomaticObjectiveTesting() {
	var model = $("[name=objective_model]:checked");

	if(model.length == 0){
		alert("Please select a model.")
		return;
	}

	var model_name = model.attr("id").replace("_objective", "");


	var parameter = $("[class=free_parameter]:checked");

	if(parameter.length == 0){
		alert("Please select a free parameter.")
		return;
	}
	else if(parameter.length > 5){
		alert("Number of free parameters is too high.");
		return;
	}

	var parameter_name = parameter.attr("id").replace("_free_parameter", "");

	// Check if the model uses the parameter...


	var vrot = GMODEL[model_name];

	var param = PARAMS.getParam(parameter_name);
	var min = param.min;
	var max = param.max;

	var slider = $("#slider_" + format_name(parameter_name));
	var steps = slider.slider("option", "step")*1000;

	var chi = Infinity;
	var optimal_parameter = null;
	var obs = VDATA.VROT_DATA;
	var obs_err = VDATA.VROT_DATA_ERROR;
	var R = VDATA.R;

	alert("Objective: " + model_name + "\nFree parameter: " + parameter_name);
	
	// TODO: Parallel approach to AutomaticObjectiveTesting

	// var parallel_job = new Parallel(R, {
	//   env: {
	//     vrot: vrot
	//   }
	// });

 
	// // Spawn a remote parallel job
	// parallel_job.spawn(function (data) {
	//   data = data.map(global.env.vrot);
	 
	//   return data;
	// }).then(function (data) {
	//   alert(data);
	// });

	// var model_output = [];

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

	// alert("Optimizing " + chi_squared_string + " for " + model_name + ":\n\n" + parameter_name + " = " + i);



}