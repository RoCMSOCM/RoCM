/* GalacticModelStyleDict.js

   GalacticModelStyleDict is a dictionary of GalacticModelStyle Objects
   
   Use: 

      GMODELSTYLE = new GalacticModelStyleDict();

      // GalacticModelStyle(model_name, model_fnc, full_name, color, opacity)

      GMODELSTYLE.add("GR", new GalacticModelStyle("GR", GMODEL.GR, "General Relativity", "green", 1));

      // Get only the vrot function by:
      GMODELSTYLE["GR"]

      // Get the GalacticModelStyle Object by:
      GMODELSTYLE.get("GR"); 
      // or
      GMODELSTYLE.getParam("GR");
 */

function GalacticModelStyleDict(){
   var dictionary = {};

   this.set = function(key, gms) { 
   		dictionary[key] = gms;
         this[key] = gms.vrot === undefined ? function(){} : gms.vrot;         
   	};

   this.getModel = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != dictionary[key].vrot){
         dictionary[key].vrot = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         dictionary[key] = new GalacticModelStyle(this[key]);
      }

      return dictionary[key]; 
   };
   this.get = function(key) { 
      // Updates the value in `this` Object
      if(this[key] !== undefined && this[key] != dictionary[key].vrot){
         dictionary[key].vrot = this[key];
      }
      else if(this[key] === undefined){
         this[key] = 0;
         dictionary[key] = new GalacticModelStyle(this[key]);
      }

      return this[key]; 
   };

   // Get the entire Params dictionary
   this.getDict = function() { return dictionary };

   this.getModels = this.getDict;

   this.self = function() { 
      var keys = Object.keys(this);
      console.log(keys);
   };

   // Input: model name, and GalacticModelStyle Object.
   this.add = function(key, gms) {
      this.set(key, gms);
   };
};