// Conversion class
function Conversion(){/*Default constructor*/};

Conversion.prototype = {
	pc_to_kpc: function(pc) {
		return pc * 0.001;
	},
	Mpc_to_kpc: function(Mpc) {
		return Mpc * 1000;
	},
	kpc_to_Mpc: function(kpc) {
		return kpc * 0.001;
	},
	kpc_to_pc: function(kpc) {
		return kpc * 1000;
	},
	kpc_to_km: function(kpc) {
		return kpc * 3.08567758 * Math.pow(10,16);
	},
	km_to_kpc: function(km) {
		return km * 3.24077929 * Math.pow(10,-17);
	},
	km_to_cm: function(km) {
		return km * 100000;
	},
	km_to_m: function(km) {
		return km * 1000;
	},
	cm_to_kpc: function(cm) {
		return cm * 3.24077929 * Math.pow(10,-22);
	},	
	cm_to_km: function(cm) {
		return cm * 1e-5;
	},	
	GeVcm3_to_kgkms2: function(GeVcm3) {
	  // GeV/cm^3 to kg/km*s^2
	  return GeVcm3 * 0.1602117 // kg/km*s^2
	},
	arcsec_to_degree: function(arcsec) {
		return arcsec * (1/3600);
	},
	degree_to_arcsec: function(degree) {
		return degree * 3600;
	},
	radian_to_degree: function(rad) {
		return rad * 180/Math.PI;
	},
	degree_to_radian: function(deg) {
		return deg * Math.PI/180;
	}
};