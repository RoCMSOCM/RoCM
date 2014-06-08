function Params(min, max, value, coeff, units) {
	this.value = value;	
	this.min = min;
	this.max = max;
	this.coeff = coeff;
	this.units = units;
};


/////////////////////////////////////////////

function Param(value, units, min, max, coeff) {
	this.value = value === undefined ? 0 : value;	
	this.units = units === undefined ? "" : units;
	this.min = min === undefined ? value : min;
	this.max = max === undefined ? value : max;
	this.coeff = coeff === undefined ? 1 : coeff;
};

Params.prototype = {};

/* ParamsDict is a dictionary of Param Objects */

function ParamsDict(){
   var dictionary = {};

   this.set = function(key, val) { 
   		// Initial value
   		dictionary["_"+key] = val;
   		// Modifiable value
   		dictionary[key] = val;
   	};

   // Returns the Param Object
   this.get = function(key) { return dictionary[key]; };

   // Use either this.getValue(key) or this.value(key) to return JUST the value of the Param object
   this.getValue = function(key) { return dictionary[key].value; };
   this.value = this.getValue;

   // Get the entire Params dictionary
   this.getDict = function() { return dictionary };
};