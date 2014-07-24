// Bulge
// TODO: Check Julia for v_bulge_b (conformal) 


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