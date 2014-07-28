/* ParamDict.js

   ParamDict is a dictionary of Param Objects
   
   Use: 
      PARAMS = new ParamDict();
      PARAMS.add("N", new Param(value, value, units, min, max));

      // Get only the value by:
      PARAMS["N"]

      // Get the Param Object by:
      PARAMS.get("N"); 
      // or
      PARAMS.getParam("N");


 */


function ParamDict(){
   this.dictionary = {};

   this.used = [];
   this.resetUsed = function() { this.used = []; }

   var findUsedParams = true;
   this.setFindUsedParams = function(tf) { findUsedParams = tf; }
   this.getFindUsedParams = function() { return findUsedParams; }

   this.initialize = function(key, param) {
      if(typeof(param) != "object"){
         param = new Param(param);
      }

      // Initial value (but preserve previous state's original value)
      if(key[0] != "_" && this.dictionary["_" + key] != undefined){
         this.dictionary["_"+key] = param;
         this["_" + key] = param.value;
      }

      // Modifiable value
      this.dictionary[key] = param;
      this[key] = param.value;       
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
      if(key[0] != "_" && this.dictionary["_" + key] == undefined){
         this.dictionary["_"+key] = param;
         this["_" + key] = param.value;
      }

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
      if(this[key] !== undefined && this[key] != this.dictionary[key].value && this.dictionary[key] !== undefined){
         this.dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         this.dictionary[key] = new Param(this[key]);
      }
      if(key[0] != "_" && this.dictionary["_" + key] === undefined){
         this["_" + key] = this[key];
         this.dictionary["_" + key] = new Param(this[key])
      }


      this.used.push(key);
      return this.dictionary[key]; 
   };
   this.get = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != this.dictionary[key].value && this.dictionary[key] !== undefined){
         this.dictionary[key].value = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         this.dictionary[key] = new Param(this[key]);
      }
      if(key[0] != "_" && this.dictionary["_" + key] === undefined){
         this["_" + key] = this[key];
         this.dictionary["_" + key] = new Param(this[key]);
      }


      this.used.push(key);
      return this[key]; 
   };
   this.getOriginal = function(key) { return this.getParam("_" + key); };

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
         this[d] = dict[d].value;
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

   this.hasOriginal = false;
};
