var B = 1.48 //km
var c = 300000 // km

var bulge_b = 0.611499 // *10^10
var bulge_t = 0.0939927

// TODO: MINIMIZE GLOBAL NAMESPACE DEFINITIONS
//sigma0 defined in RoBT 
//r0 defined in RoBT 
//Rkpc defined in RoBT 
//R0 defined in RoBT 
//N* defined in RoBT 

var CONVERT = new Conversion();

function GalacticModel(){};

GalacticModel.prototype = {
	v_gr: function() {
		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size)
		
		var R0km = CONVERT.kpc_to_km(PARAMS["R0"]);

		for(var i=0;i<R_size;i++){
			var R = CONVERT.kpc_to_km(VDATA.Rkpc[i]);
			var x = (R/(2*R0km));
			var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

			v_rot[i] = Math.sqrt(R * ( ((PARAMS["N*"]*B*c*c*R)/(2*R0km*R0km*R0km)) * bessel_func ) );

		}

		return v_rot;
	},
	v_gr_no_calc: function() {
		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size);

		for(var i=0;i<R_size;i++){
			v_rot[i] = VDATA.VROT_GR[i]/Math.sqrt(PARAMS["prev_N*"]) * Math.sqrt(PARAMS["N*"]);
		}

		return v_rot;
	},
	v_dark: function() {
		var R_size = VDATA.Rkpc.length; 
		var local_sigma0 = CONVERT.GeVcm3_to_kgkms2(PARAMS["sigma0"]);
		var v_rot = new Array(R_size);
		var inner;

		for(var i=0;i<R_size;i++){
			inner = (4*Math.PI*B*c*c*local_sigma0) * (1-((PARAMS["r0"]/VDATA.Rkpc[i])*Math.atan(VDATA.Rkpc[i]/PARAMS["r0"])));
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
			v_rot[i] = VDATA.VROT_CONFORMAL[i]/Math.sqrt(PARAMS["prev_N*"]) * Math.sqrt(PARAMS["N*"]);
		}

		return v_rot;
	},
	v_conformal: function() {
		var Rkpc = VDATA.Rkpc;

		var R_size = VDATA.Rkpc.length; 
		var v_rot = new Array(R_size);

		var mod = CONVERT.cm_to_kpc(1);
		var norm = CONVERT.kpc_to_km(1);
		var cMod = CONVERT.km_to_cm(c)*mod;	//TODO: c
		var BMod = CONVERT.km_to_cm(B)*mod;	//TODO: B

		var m = (3.06*Math.pow(10,-30))/mod;
		var g = (5.42*Math.pow(10,-41))/mod;
		var k = (18*Math.pow(10,-11));

		var R0kpc = PARAMS["R0"];
		var R0km = CONVERT.kpc_to_km(R0kpc);

		var N_g = PARAMS["N_g"];

		var bulge = new Bulge(Rkpc, bulge_b, bulge_t);

		for(var i=0;i<R_size;i++){
			var Xkpc = Rkpc[i];
			var besx2 = Xkpc/(2*R0kpc);
			var besx8 = Xkpc/(8*R0kpc);
		
			var veln = Math.pow(norm,2)*((BMod*Math.pow(cMod,2)*Math.pow(Xkpc,2))/(2*Math.pow(R0kpc,3))) * (besseli(besx2,0)*besselk(besx2,0) - besseli(besx2,1)*besselk(besx2,1));

			var velm = Math.pow(norm,2)*((m*Math.pow(cMod,2)*Xkpc)/2);
			var velb = Math.pow(norm,2)*(((g*Math.pow(cMod,2)*Math.pow(Xkpc,2))/(2*R0kpc))*(besseli(besx2,1)*besselk(besx2,1)));
			var velk = Math.pow(norm,2)*((k*Math.pow(cMod,2)*Math.pow(Xkpc,2))/2);

			var veln_gas = Math.pow(norm,2)*((N_g*BMod*Math.pow(cMod,2)*Math.pow(Xkpc,2))/(2*64*Math.pow(R0kpc,3)))*(besseli(besx8,0)*besselk(besx8,0)-besseli(besx8,1)*besselk(besx8,1));
			var velb_gas = Math.pow(norm,2)*((N_g*g*Math.pow(cMod,2)*Math.pow(Xkpc,2))/(8*R0kpc))*(besseli(besx8,1)*besselk(besx8,1));

			v_rot[i] = Math.sqrt((PARAMS["N*"]*(veln + velb)) + velm - velk + veln_gas + velb_gas + bulge[i]);
		}

		return v_rot;
	}
};


// Bulge
// TODO: Check Julia for v_bulge_b (conformal) 
function Bulge(x, bulge, t) {
	var R_size = x.length;
	var bulge_contrib = new Array(R_size);

	//Numerical integration function
	var integral_func = function(z) {
		return Math.pow(z,2)*besselk(z,0);
	};

	for(var i=0;i<R_size;i++){
		bulge_contrib[i] = bulge*27478.2/x[i]*numerically_integrate(0.00001, x[i]/t, 1, integral_func);
	}

	return bulge_contrib;
};


function GModel() {};

GModel.prototype = {
	VROT_GR: function(Rkpc) {
		var R0km = CONVERT.kpc_to_km(PARAMS["R0"]);
		var R = CONVERT.kpc_to_km(Rkpc);

		var x = (R/(2*R0km));
		var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

		var c = CONST["c"];
		var B = PARR.value("B");

		var vrot = Math.sqrt(R * (((PARAMS["N*"]*B*c*c*R)/(2*R0km*R0km*R0km)) * bessel_func));

		return vrot;
	},
	VROT_DARK: function(Rkpc) {
		var local_sigma0 = CONVERT.GeVcm3_to_kgkms2(PARAMS["sigma0"]);

		var inner = (4*Math.PI*B*c*c*local_sigma0) * (1-((PARAMS["r0"]/Rkpc)*Math.atan(Rkpc/PARAMS["r0"])));
		var vrot = Math.sqrt(Math.abs(inner));

		return vrot;
	}
};