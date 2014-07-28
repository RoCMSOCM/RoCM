/* GalacticModelStyleDict.js

   GalacticModelStyleDict is a dictionary of GalacticModelStyle Objects
   
   Use: 

      STYLE = new GalacticModelStyleDict();

      // GalacticModelStyle(model_name, model_fnc, full_name, color, opacity)

      STYLE.add("GR", new GalacticModelStyle("GR", GMODEL.GR, "General Relativity", "green", 1));

      // Get only the vrot function by:
      STYLE["GR"]

      // Get the GalacticModelStyle Object by:
      STYLE.get("GR"); 
      // or
      STYLE.getParam("GR");
 */

function GalacticModelStyleDict(){
   this.dictionary = {};

   this.set = function(key, gms) { 
         this.dictionary[key] = gms;
      };

   this.getModel = function(key) { 
      // Updates the value in `this` Object
      if(this.dictionary[key] === undefined){
         this.dictionary[key] = new GalacticModelStyle(key);
      }

      return this.dictionary[key]; 
   };

   this.get = function(key) { 
      return this.getModel(key);
   };

   // Get the entire GalacticModelStyleDict this.dictionary
   this.getDict = function() { 
      return this.dictionary 
   };
   this.setDict = function(dict) { 
      this.dictionary = dict 
   };

   this.getModels = this.getDict;

   this.self = function() { 
      var keys = Object.keys(this);
      console.log(keys);
   };

   // Input: model name, and GalacticModelStyle Object.
   this.add = function(key, gms) {
      this.set(key, gms);
   };

   this.exists = function(key) {
      return !(this.dictionary[key] === undefined);

   }

};