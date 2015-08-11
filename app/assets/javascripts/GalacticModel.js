function GalacticModel() {};

GalacticModel.prototype = {
	GR: function(R) {
		var R0 = PARAMS.get("scale_length");
		var R0km = CONVERT.kpc_to_km(R0);
		var Rkm = CONVERT.kpc_to_km(R);

		var x = (Rkm/(2*R0km));
		var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

		var c = CONST.get("speed_of_light");
		var B = CONST.get("schwarzschild_radius");

		var mass = PARAMS.get("mass_disk");
		var solar_mass = CONST.get("solar_mass");

		var Nstar = mass/solar_mass;

		var bulge = BULGE(R);

		var rotation_velocity = Math.sqrt(Rkm * (((Nstar*B*c*c*Rkm)/(2*R0km*R0km*R0km)) * bessel_func));

		rotation_velocity = Math.sqrt(rotation_velocity*rotation_velocity + bulge);
		
		return rotation_velocity;
	},
	DARK: function(R) {
		var sigma0 = PARAMS.get("dark_matter_density");
		var sigma0_si = CONVERT.GeVcm3_to_kgkms2(sigma0);

		var r0 = PARAMS.get("dark_halo_radius");

		var c = CONST.get("speed_of_light");
		var B = CONST.get("schwarzschild_radius");

		var inner = (4*Math.PI*B*c*c*sigma0_si) * (1-((r0/R)*Math.atan(R/r0)));
		var rotation_velocity = Math.sqrt(Math.abs(inner));

		return rotation_velocity;
	},
	CONFORMAL: function(R) {
		var mod = CONVERT.cm_to_kpc(1);
		var norm = CONVERT.kpc_to_km(1);

		var c = CONST.get("speed_of_light");
		var B = CONST.get("schwarzschild_radius");

		var cMod = CONVERT.km_to_cm(c)*mod;
		var BMod = CONVERT.km_to_cm(B)*mod;

		var gamma_star = (3.06*Math.pow(10,-30))/mod;
		var gamma_0 = (5.42*Math.pow(10,-41))/mod;
		var kappa = (18*Math.pow(10,-11));

		var R0kpc = PARAMS.get("scale_length"); 
		var R0km = CONVERT.kpc_to_km(R0kpc);

		var mass = PARAMS.get("mass_disk");
		var gas_mass = PARAMS.get("mass_hydrogen");
		var solar_mass = CONST.get("solar_mass");

		var Nstar = mass/solar_mass;

	    var Ng = gas_mass/solar_mass;

		var bulge = BULGE(R);

		var besx2 = R/(2*R0kpc);
		var besx8 = R/(8*R0kpc);
		
		var veln = Math.pow(norm,2)*((BMod*Math.pow(cMod,2)*Math.pow(R,2))/(2*Math.pow(R0kpc,3))) * (besseli(besx2,0)*besselk(besx2,0) - besseli(besx2,1)*besselk(besx2,1));

		var vel_gamma_star = Math.pow(norm,2)*((gamma_star*Math.pow(cMod,2)*R)/2);
		var vel_gamma_0 = Math.pow(norm,2)*(((gamma_0*Math.pow(cMod,2)*Math.pow(R,2))/(2*R0kpc))*(besseli(besx2,1)*besselk(besx2,1)));
		var vel_kappa = Math.pow(norm,2)*((kappa*Math.pow(cMod,2)*Math.pow(R,2))/2);

		var veln_gas = Math.pow(norm,2)*((Ng*BMod*Math.pow(cMod,2)*Math.pow(R,2))/(2*64*Math.pow(R0kpc,3)))*(besseli(besx8,0)*besselk(besx8,0)-besseli(besx8,1)*besselk(besx8,1));
		var vel_gamma_0_gas = Math.pow(norm,2)*((Ng*gamma_0*Math.pow(cMod,2)*Math.pow(R,2))/(8*R0kpc))*(besseli(besx8,1)*besselk(besx8,1));

		var rotation_velocity = Math.sqrt((Nstar*(veln + vel_gamma_0)) + vel_gamma_star - vel_kappa + veln_gas + vel_gamma_0_gas + bulge);

		return rotation_velocity;
	},
	TOTAL: function(R) {
		var GR = this.GR(R);
		var DARK = this.DARK(R);
		var rotation_velocity = Math.sqrt(GR*GR + DARK*DARK);

		return rotation_velocity;
	},
	MOND: function(R) {
		// Constants
		var mod        = CONVERT.cm_to_kpc(1);
		var norm       = CONVERT.kpc_to_km(1);
		var solar_mass = CONST.get("solar_mass");
		var c          = CONST.get("speed_of_light");
		var B          = CONST.get("schwarzschild_radius");
		var cMod       = CONVERT.km_to_cm(c)*mod;
		var BMod       = CONVERT.km_to_cm(B)*mod;

		// Galaxy parameters
		var R0kpc    = PARAMS.get("scale_length"); 
		var R0gas    = 4*R0kpc;             // gas scale_length
		var mass     = PARAMS.get("mass_disk");
		var gas_mass = PARAMS.get("mass_hydrogen");
		var Nstar    = mass/solar_mass;
	    var Ng       = gas_mass/solar_mass; // number of gas stars

		// MOND constants
		var monda  = 1.23*Math.pow(10,-8); // cm/s^2 
		var mondb  = 1.35*Math.pow(10,-8); // cm/s^2
		var mondaf = 3.24077929*Math.pow(10,-22)*monda; // cm/s^2
		var mondbf = 3.24077929*Math.pow(10,-5)*mondb; // cm/s^2

		// General relativity contribution
		var GR = this.GR(R);

		var besx_gas = R/(2*R0gas);
		var veln_gas = Math.pow(norm,2)*((Ng*BMod*Math.pow(cMod,2)*Math.pow(R,2))/(2*Math.pow(R0gas,3)))*(besseli(besx_gas,0)*besselk(besx_gas,0)-besseli(besx_gas,1)*besselk(besx_gas,1));
		
		var bulge = BULGE(R);
		var mond =  GR*GR + veln_gas;
		var rotation_velocity = Math.sqrt( mond + (mond * ((Math.sqrt((1 + ((norm*mondbf*R)/mond))) - 1)/2)));

		return rotation_velocity;		
	}	
};