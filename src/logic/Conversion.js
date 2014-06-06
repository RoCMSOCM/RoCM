// Conversion class
function Conversion(){/*Default constructor*/}

Conversion.prototype = {
	kpc_to_km: function(kpc) {
		var return_val = kpc * 3.08567758 * Math.pow(10,16)
		return return_val
	},
	GeVcm3_to_kgkms2: function(GeV) {
	  // GeV/cm^3 to kg/km*s^2
	  return GeV * 0.1602117 // kg/km*s^2
	}
}