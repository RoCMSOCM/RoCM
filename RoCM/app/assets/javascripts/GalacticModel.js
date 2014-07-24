// function GalacticModel(model_name, model_fnc, full_name, color, opacity) {
// 	this.model_name = model_name !== undefined ? model_name : "CUSTOM" + Math.round(new Date().getTime() / 1000);
// 	this[this.model_name] = model_fnc;
// 	this.full_name = full_name !== undefined ? full_name : "Custom Model";
// 	this.color = color !== undefined ? color : "#black";
// 	this.opacity = opacity !== undefined ? opacity : 1;
// };

function GalacticModel() {};

GalacticModel.prototype = {
	GR: function(R) {
		// var distance = PARAMS.get("distance");
		

		
		var R0 = PARAMS.get("scale_length");
		var R0km = CONVERT.kpc_to_km(R0);
		var Rkm = CONVERT.kpc_to_km(R);

		var x = (Rkm/(2*R0km));
		var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

		var c = CONST.get("c");
		var B = PARAMS.get("B");

		var mass = PARAMS.get("mass_disk");

		var Nstar = mass_to_stars(true_mass(mass));

		var bulge_b = PARAMS.get("bulge_b");
		var bulge_t = PARAMS.get("bulge_t");

		var bulge = BULGE(R, bulge_b, bulge_t);

		var rotation_velocity = Math.sqrt(Rkm * (((Nstar*B*c*c*Rkm)/(2*R0km*R0km*R0km)) * bessel_func));

		rotation_velocity = Math.sqrt(rotation_velocity*rotation_velocity + bulge);
		
		return rotation_velocity;
	},
	DARK: function(R) {
		var sigma0 = PARAMS.get("sigma0");
		var sigma0_si = CONVERT.GeVcm3_to_kgkms2(sigma0);

		var r0 = PARAMS.get("r0");

		var c = CONST.get("c");
		var B = PARAMS.get("B");

		var inner = (4*Math.PI*B*c*c*sigma0_si) * (1-((r0/R)*Math.atan(R/r0)));
		var rotation_velocity = Math.sqrt(Math.abs(inner));

		return rotation_velocity;
	},
	CONFORMAL: function(R) {
		var mod = CONVERT.cm_to_kpc(1);
		var norm = CONVERT.kpc_to_km(1);

		var c = CONST.get("c");
		var B = PARAMS.get("B");

		var cMod = CONVERT.km_to_cm(c)*mod;
		var BMod = CONVERT.km_to_cm(B)*mod;	//TODO: B

		var m = (3.06*Math.pow(10,-30))/mod;
		var g = (5.42*Math.pow(10,-41))/mod;
		var k = (18*Math.pow(10,-11));

		var R0kpc = PARAMS.get("scale_length"); 
		var R0km = CONVERT.kpc_to_km(R0kpc);

		var mass = PARAMS.get("mass_disk");
		var gas_mass = PARAMS.get("mass_hydrogen");

		var Nstar = mass_to_stars(true_mass(mass));

	    var Ng = mass_to_stars(true_mass(gas_mass));

		var bulge_b = PARAMS.get("bulge_b");
		var bulge_t = PARAMS.get("bulge_t");

		var bulge = BULGE(R, bulge_b, bulge_t);

		var besx2 = R/(2*R0kpc);
		var besx8 = R/(8*R0kpc);
		
		var veln = Math.pow(norm,2)*((BMod*Math.pow(cMod,2)*Math.pow(R,2))/(2*Math.pow(R0kpc,3))) * (besseli(besx2,0)*besselk(besx2,0) - besseli(besx2,1)*besselk(besx2,1));

		var velm = Math.pow(norm,2)*((m*Math.pow(cMod,2)*R)/2);
		var velb = Math.pow(norm,2)*(((g*Math.pow(cMod,2)*Math.pow(R,2))/(2*R0kpc))*(besseli(besx2,1)*besselk(besx2,1)));
		var velk = Math.pow(norm,2)*((k*Math.pow(cMod,2)*Math.pow(R,2))/2);

		var veln_gas = Math.pow(norm,2)*((Ng*BMod*Math.pow(cMod,2)*Math.pow(R,2))/(2*64*Math.pow(R0kpc,3)))*(besseli(besx8,0)*besselk(besx8,0)-besseli(besx8,1)*besselk(besx8,1));
		var velb_gas = Math.pow(norm,2)*((Ng*g*Math.pow(cMod,2)*Math.pow(R,2))/(8*R0kpc))*(besseli(besx8,1)*besselk(besx8,1));

		var rotation_velocity = Math.sqrt((Nstar*(veln + velb)) + velm - velk + veln_gas + velb_gas + bulge);

		return rotation_velocity;
	},
	TOTAL: function(R) {
		var GR = this.GR(R);
		var DARK = this.DARK(R);
		var rotation_velocity = Math.sqrt(GR*GR + DARK*DARK);

		return rotation_velocity;
	},
	MOND: function(R) {
		return 0;

		var a0;
		var gr_rotation_velocity = this.GR(R);
		var eta_i;
		var big_R;
		var q;

		/*


		var solar_mass = CONST.get("solar_mass");

		var G0 = PARAMS.get("G0");
		var M0 = PARAMS.get("M0");

		var r0 = CONVERT.cm_to_kpc(PARAMS.get("MONDr0"));

		var M = PARAMS.get("mass_disk"); // TODO: Add mass_hydrogen (M_HI)

		var rotation_velocity = Math.sqrt((G0 * M)/R)*Math.sqrt(1 + Math.sqrt(M0/M)*(1-Math.exp(-R/r0)*(1+R/r0) ) );

		return rotation_velocity;
		*/
	}
};