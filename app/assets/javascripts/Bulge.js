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

function BULGE(R, LOCAL_BULGE, IS_PARALLEL) {
	if(LOCAL_BULGE === undefined)
		LOCAL_BULGE = GLOBAL_BULGE;

	var mass_bulge = PARAMS.get("mass_bulge");
	var	scale_length_bulge = PARAMS.get("scale_length_bulge");

	// Can't integrate if R == 0, you'd receive a NaN.
	// Also check if the galaxy has a bulge via the GLOBAL_BULGE (LOCAL_BULGE for AOT parallel)
	if(R != 0 && LOCAL_BULGE){
		// To avoid redundant bulge computation
		// cache it if the mass_bulge & scale_length_bulge haven't changed 
		var cache = false;
		if(!IS_PARALLEL){
			cache = cache_bulge(R, mass_bulge, scale_length_bulge);
		}

		if(cache == false)
			return calculate_bulge(R, mass_bulge, scale_length_bulge);
		else
			return cache;
	
	}
	else
		return 0;
};

function calculate_bulge(R, mass_bulge, scale_length_bulge) {
	var bulge_contrib = mass_bulge*27478.2/R*numerically_integrate(0.0001, R/scale_length_bulge, 1, integral_func);

	return bulge_contrib;
}

BULGE_CACHE = null;
function cache_bulge(R, mass_bulge, scale_length_bulge) {
	// var storage = localStorage.getItem("bulge_cache");
	if(BULGE_CACHE != null) {
		if(BULGE_CACHE.mass_bulge == mass_bulge && BULGE_CACHE.scale_length_bulge == scale_length_bulge){
			var R_index = BULGE_CACHE.data.R.indexOf(R);
			if(R_index == -1)
				return false;
			else
				return BULGE_CACHE.data.BULGE[R_index];
		}
	}
	
	// If there isn't a cache or if the bulge parameters are different
	// Then create / update the cache
	var R = VDATA.R;
	BULGE_CACHE = {
		data: {
			R: R,
			BULGE: R.map(function(R) {
				return calculate_bulge(R, mass_bulge, scale_length_bulge);
			}),
		},
		mass_bulge: mass_bulge,
		scale_length_bulge: scale_length_bulge
	};

	// localStorage.setItem("bulge_cache", JSON.stringify(bulge_cache));
	return false;
}