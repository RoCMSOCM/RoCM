// Bulge

function default_bulge(galaxy_name){
	// If the bulge toggle was checked for this galaxy, use that boolean value.
	// Else use the boolean value from the 'defaults' array

	var savedBulge = localStorage.getItem("GLOBAL_BULGE");
	var localStorage_PARAMS = localStorage.getItem("PARAMS");
	var prev_galaxy_name;

	if(localStorage_PARAMS != null){
		prev_galaxy_name = JSON.parse(localStorage_PARAMS)["galaxy_name"];
		if(prev_galaxy_name != undefined)
			prev_galaxy_name = prev_galaxy_name.value;
	}

	if(savedBulge != null && galaxy_name == prev_galaxy_name){
		return (savedBulge == "true");
	}


	var defaults = ["MILKY-WAY"];
	for(var i=0;i<defaults.length; i++) {
		if(defaults[i] == galaxy_name){
			return true;
		}
	}

	return false;
}

//Numerical integration function
var integral_func = function(z) {
	return Math.pow(z,2)*besselk(z,0);
};

function BULGE(x, bulge_b, bulge_t) {
	if(GLOBAL_BULGE){
		var bulge_contrib = bulge_b*27478.2/x*numerically_integrate(0.00001, x/bulge_t, 1, integral_func);
		
		return bulge_contrib;
	}
	else
		return 0;
};
