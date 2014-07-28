// Bulge

function default_bulge(galaxy_name){
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
