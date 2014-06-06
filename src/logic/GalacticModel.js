var B = 1.48 //km
var c = 300000 // km

var bulge_b = 0.611499 // *10^10
var bulge_t = 0.0939927

// TODO: MINIMIZE GLOBAL NAMESPACE DEFINITIONS
//sigma0 defined in RoBT 
//r0 defined in RoBT 
//Rkpc defined in RoBT 
//R0kpc defined in RoBT 
//Nstar defined in RoBT 

function GalacticModel(){/*Default constructor*/}

GalacticModel.prototype = {
	v_gr: function() {
		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size)
		
		var convert = new Conversion();
		var R0km = convert.kpc_to_km(PARAMS.R0kpc);


		for(var i=0;i<R_size;i++){
			var R = convert.kpc_to_km(VDATA.Rkpc[i]);
			var x = (R/(2*R0km));
			var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

			v_rot[i] = Math.sqrt(R * ( ((PARAMS.Nstar*B*c*c*R)/(2*R0km*R0km*R0km)) * bessel_func ) );

		}

		return v_rot;
	},
	v_gr_no_calc: function() {
		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size)

		for(var i=0;i<R_size;i++){
			v_rot[i] = VDATA.VROT_GR[i]/Math.sqrt(PARAMS.prev_Nstar) * Math.sqrt(PARAMS.Nstar);
		}

		return v_rot;
	},
	v_dark: function() {
		var R_size = VDATA.Rkpc.length; 
		var convert = new Conversion();
		var local_sigma0 = convert.GeVcm3_to_kgkms2(PARAMS.sigma0);
		var v_rot = new Array(R_size);
		var inner;

		for(var i=0;i<R_size;i++){
			inner = (4*Math.PI*B*c*c*local_sigma0) * (1-((PARAMS.r0/VDATA.Rkpc[i])*Math.atan(VDATA.Rkpc[i]/PARAMS.r0)));
			v_rot[i] = Math.sqrt(Math.abs(inner));
		}

		return v_rot;
	},
	// TODO: Implement full CONFORMAL GRAVITY
	v_conformal_no_calc: function() {
		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size)

//TODO
		for(var i=0;i<R_size;i++){
			v_rot[i] = 99;//VDATA.VROT_CONFORMAL[i]/Math.sqrt(PARAMS.prev_Nstar) * Math.sqrt(PARAMS.Nstar);
		}

		return v_rot;
	}
}


// Bulge
function Bulge() {/*Default constructor*/}

Bulge.prototype = {
	//Numerical integration function
	integral_func: function(z) {
		return Math.pow(z,2)*besselk(z,0);
	},
	v_bulge_n: function(x, bulge, t) {
		var R_size = x.length;
		var bulge_contrib = new Array(R_size);

		for(var i=0;i<R_size;i++){
			bulge_contrib[i] = bulge*27478.2/x[i]*numerically_integrate(0.00001, x[i]/t, 1, integral_func);
		}

	  //Finished with heavy calulations
	  calc_done = true;
	  return bulge_contrib;
	}
}