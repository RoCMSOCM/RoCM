/*

   Param Object Type
   
   value: number value of the parameter
   units: string units of the parameter
   min: minimun number for the parameter (to be used in ParamSlider)
   max: maximum number for the parameter (to be used in ParamSlider)

*/

function Param(value, units, multiplier, min, max) {
	this.value = value === undefined ? 0 : value;	
	this.units = units === undefined ? "" : units;
	this.multiplier = multiplier === undefined ? 1 : multiplier;
	this.min = min === undefined ? isNaN(value) ? 0 : value <= 0.01 ? value/10 : 0 : min;
	this.max = max === undefined ? isNaN(value) ? 0 : value*5 : max;
};



function add_param(param_name, param_full_name, param) {
	var units = param.units;
	var multiplier = param.multiplier;

	FORMATTED_MAP[param_name] = {name: param_full_name, units: units, multiplier: multiplier};

	if(typeof(param) != "object")
		PARAMS.add(param_name, new Param(param));
	else
		PARAMS.add(param_name, param);

	localStorage.setItem("FORMATTED_MAP", JSON.stringify(FORMATTED_MAP));
}
