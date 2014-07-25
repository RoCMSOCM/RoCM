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
   this.dictionary = {};

   this.used = [];
   this.resetUsed = function() { this.used = []; }

   this.initialize = function(key, param) {
      // Initial value
      this.dictionary["_"+key] = param;
      this["_" + key] = param.value;

      // Modifiable value
      this.dictionary[key] = param;
      this[key] = param.value;       
   };

   this.set = function(key, param) { 
		// Modifiable value
		this.dictionary[key] = param;
      this[key] = param.value;       

      this.update_localStorage();
	};

   this.setValue = function(key, value) {
      // Modifiable value
      this.dictionary[key].value = value;
      this[key] = value;       

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
   this.getParam = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != this.dictionary[key].value){
         this.dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         this.dictionary[key] = new Param(this[key]);
      }

      this.used.push(key);
      return this.dictionary[key]; 
   };
   this.get = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != this.dictionary[key].value){
         this.dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         this.dictionary[key] = new Param(this[key]);
      }

      this.used.push(key);
      return this[key]; 
   };
   this.getOriginal = function(key) { return this.getParam("_" + key); };

   // Get the entire Params this.dictionary
   this.getDict = function() { 
      return this.dictionary;
   };
   this.setDict = function(dict) { 
      // this.dictionary = dict;
      for(var d in dict){
         if(d[0] != "_"){
            this.dictionary[d] = dict[d];
            this[d] = dict[d].value;
         }
      }
   };

   this.getParams = this.getDict;

   this.self = function() { 
      var keys = Object.keys(this);
      console.log(keys);
   };

   // Input: parameter name, and Param Object.
   this.add = function(key, param) {
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