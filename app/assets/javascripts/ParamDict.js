/* ParamDict.js

   ParamDict is a dictionary of Param Objects
   
   Use: 
      PARAMS = new ParamDict();
      PARAMS.add("mass_disk", new Param(value, units, multiplier, min, max));

      // Get the true value by:
      PARAMS.get("mass_disk")

      // Get the displayed value by: 
      PARAMS.getValue("mass_disk");

      // Get the Param Object by:
      PARAMS.getParam("mass_disk");


 */

function ParamDict(){
   this.dictionary = {};

   this.used = [];
   this.resetUsed = function() { this.used = []; }

   var findUsedParams = true;
   this.setFindUsedParams = function(tf) { findUsedParams = tf; }
   this.getFindUsedParams = function() { return findUsedParams; }

   this.uninitialized = [];
   this.reset_uninitialized = function() { this.uninitialized = []; };

   this.checkRange = function(key) {
      return this.dictionary[key].value <= 0.00001 && this.dictionary[key] > 0;
   }

   this.initialize = function(key, param) {
      if(typeof(param) != "object"){
         param = new Param(param);
      }

      // Initial value (but preserve previous state's original value)
      if(key[0] != "_" && this.hasOriginal(key)){
         this.dictionary["_"+key] = param;
      }

      // Modifiable value
      this.dictionary[key] = param;
   };

   // Input: parameter name, and Param Object.
   this.add = function(key, param) {
      this.set(key, param);
   };

   this.set = function(key, param) { 
      if(param.value == undefined || typeof(param) != "object"){
         param = new Param(param);
      }

      // Initial value if undefined
      if(key[0] != "_" && this.hasOriginal(key)){
         this.dictionary["_"+key] = param;
      }

		// Modifiable value
		this.dictionary[key] = param;

      this.update_localStorage();
	};

   this.setValue = function(key, value) {
      // Modifiable value
      this.dictionary[key].value = value;

      this.update_localStorage();
   };

   this.update_localStorage = function() {
      this.resetUsed();
      localStorage.removeItem("PARAMS");
      localStorage.setItem("PARAMS", JSON.stringify(this.dictionary));
   };


   // Get just value by Param[key]
   // or   
   // Get the full Param Object
   this.check = function(key) {
      // This gets called in the 'get' functions.
      // Checks for an initialized Param
      // Also checks for an original Param value

      if(this.dictionary[key] === undefined){
         this.uninitialized.push(key);
         return null;
      }

      if(key[0] != "_" && !this.hasOriginal(key)){
         this.dictionary["_" + key] = new Param(this.dictionary[key].value);
      }

      return true;
   }
   this.getParam = function(key) { 
      var check = this.check(key);
      if(check == null)
         return check;

      this.used.push(key);
      return this.dictionary[key]; 
   };
   this.getValue = function(key) { 
      var check = this.check(key);
      if(check == null)
         return check;

      var value = this.dictionary[key].value;

      this.used.push(key);
      return value;
   };
   this.getMultiplier = function(key) { 
      var check = this.check(key);
      if(check == null)
         return check;

      var multiplier = this.dictionary[key].multiplier;

      this.used.push(key);
      return multiplier;
   };
   this.get = function(key) { 
      // Gets the true value of the Param (value * multiplier)
      var check = this.check(key);
      if(check == null)
         return null;

      var value = this.getValue(key);
      var multiplier = this.getMultiplier(key);
      var return_value;

      if(value == null || multiplier == null)
         return null;

      if(isNaN(value))
         return_value = value;
      else
         return_value = value * multiplier;

      this.used.push(key);
      return return_value; 
   };
   this.getOriginalParam = function(key) { return this.getParam("_" + key); };
   this.getOriginal = function(key) { return this.get("_" + key); };
   this.hasOriginal = function(key) { return (this.dictionary["_" + key] !== undefined); }

   this.updateUsed = function(key) { 
      // if(this.getFindUsedParams())
         this.used.push(key);
   }

   // Get the entire Params this.dictionary
   this.getDict = function() { 
      this.resetUsed();
      return this.dictionary;
   };
   this.setDict = function(dict) { 
      this.resetUsed();
      for(var d in dict){
         this.dictionary[d] = dict[d];
      }
   };

   this.getParams = this.getDict;

   this.self = function() { 
      var keys = Object.keys(this);
      console.log(keys);
   };

   this.setMin = function(key, min) {
      this.getParam(key).min = min;
   };

   this.setMax = function(key, max) {
      this.getParam(key).max = max;
   };

   this.setRange = function(key, min, max) {
      this.setMin(key, min);
      this.setMax(key, max);
   };
};