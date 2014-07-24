// Bulge
// TODO: Check Julia for v_bulge_b (conformal) 


//Numerical integration function
var integral_func = function(z) {
	return Math.pow(z,2)*besselk(z,0);
};

function Bulge(x, bulge, t) {
	var R_size = x.length;
	var bulge_contrib = new Array(R_size);

	for(var i=0;i<R_size;i++){
		bulge_contrib[i] = bulge*27478.2/x[i]*numerically_integrate(0.00001, x[i]/t, 1, integral_func);
	}

	return bulge_contrib;
};

function BULGE(x, bulge_b, bulge_t) {
	return 0;
	var bulge_contrib = bulge_b*27478.2/x*numerically_integrate(0.00001, x/bulge_t, 1, integral_func);
	
	return bulge_contrib;
};
