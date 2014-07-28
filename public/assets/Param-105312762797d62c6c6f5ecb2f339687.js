/*

   Param Object Type
   
   value: number value of the parameter
   units: string units of the parameter
   min: minimun number for the parameter (to be used in ParamSlider)
   max: maximum number for the parameter (to be used in ParamSlider)

*/


function Param(value, units, min, max) {
	this.value = value === undefined ? 0 : value;	
	this.units = units === undefined ? "" : units;
	this.min = min === undefined ? value/2 : min;
	this.max = max === undefined ? value*2 : max;
};
