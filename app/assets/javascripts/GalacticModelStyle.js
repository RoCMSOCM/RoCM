function GalacticModelStyle(model_name, full_name, color, opacity) {
	var current_time = new Date().getTime();
	var upper_time = Math.round(current_time / 10000) * 10000;

	var time = Math.abs(current_time - upper_time);

	this.model_name = model_name !== undefined ? model_name : "User Defined Model " + time;
	this.full_name = full_name !== undefined ? full_name : "User Defined Model " + time;
	this.color = color !== undefined ? color : "purple";
	this.opacity = opacity !== undefined ? opacity : 1;
};

var model_map = {
	  DATA: {full_name: "Observational Data", color: "brown", opacity: 1},
	  DATA_ERROR: {full_name: "Observational Data Error", color: "#edd4d4", opacity: 1},
	  DARK: {full_name: "Dark Matter (ΛCDM)", color: "#f6931f", opacity: 0},
	  GR: {full_name: "General Relativity", color: "green", opacity: 1},
	  TOTAL: {full_name: "Total = (GR + ΛCDM)", color: "black", opacity: 0},
	  CONFORMAL: {full_name: "Conformal Gravity", color: "navy", opacity: 0},
	  MOND: {full_name: "MOND", color: "purple", opacity: 0}
}

function style_galactic_models() {
	for(var model in model_map){
		if(!STYLE.exists(model)){
			var this_model = model_map[model];
			var full_name;
			var color;
			var opacity;

			full_name = this_model.full_name;
			color = this_model.color;
			opacity = this_model.opacity;

			var gms = new GalacticModelStyle(model, full_name, color, opacity);
			STYLE.add(model, gms);
		}
	}
}