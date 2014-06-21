// Conversion class
function Conversion(){/*Default constructor*/};

Conversion.prototype = {
	kpc_to_km: function(kpc) {
		return kpc * 3.08567758 * Math.pow(10,16);
	},
	km_to_kpc: function(km) {
		return km * 3.24077929 * Math.pow(10,-17);
	},
	km_to_cm: function(km) {
		return km * 100000;
	},
	cm_to_kpc: function(cm) {
		return cm * 3.24077929 * Math.pow(10,-22);
	},	
	GeVcm3_to_kgkms2: function(GeV) {
	  // GeV/cm^3 to kg/km*s^2
	  return GeV * 0.1602117 // kg/km*s^2
	}
};