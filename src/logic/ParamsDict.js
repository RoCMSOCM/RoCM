/* ParamsDict.js

   ParamsDict is a dictionary of Param Objects
   
   Use: 
      PARAMS = new ParamsDict();
      PARAMS.add("N", new Param(value, value, units, min, max));

      // Get only the value by:
      PARAMS["N"]

      // Get the Param Object by:
      PARAMS.get("N"); 
      // or
      PARAMS.getParam("N");


 */

function ParamsDict(){
   var dictionary = {};

   this.used = [];
   this.resetUsed = function() { this.used = []; }

   this.set = function(key, param) { 
   		// Initial value
   		dictionary["_"+key] = param;

   		// Modifiable value
   		dictionary[key] = param;
   	};

   // Get just value by Param[key]
   // or   
   // Get the full Param Object
   this.getParam = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != dictionary[key].value){
         dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         dictionary[key] = new Param(this[key]);
      }

      this.used.push(key);
      return dictionary[key]; 
   };
   this.get = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != dictionary[key].value){
         dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         dictionary[key] = new Param(this[key]);
      }

      this.used.push(key);
      return this[key]; 
   };
   this.getOriginal = function(key) { return this.getParam("_" + key); };


   // Get the entire Params dictionary
   this.getDict = function() { return dictionary };

   this.getParams = this.getDict;

   this.self = function() { 
      var keys = Object.keys(this);
      console.log(keys);
   };

   // Input: parameter name, and Param Object.
   this.add = function(key, param) {
      // TODO: Check if not param

      this[key] = param.value;
      this["_" + key] = param.value;

      this.set(key, param);
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

   this.hasOriginal = false;
};