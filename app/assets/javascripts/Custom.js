function CUSTOM(R) {
  // General Relativity 
  var R0 = PARAMS.get("scale_length");
  var R0km = CONVERT.kpc_to_km(R0);
  var Rkm = CONVERT.kpc_to_km(R);

  var x = (Rkm/(2*R0km));
  var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

  var c = CONST.get("c");
  var B = CONST.get("schwarzschild_radius");

  var mass = PARAMS.get("mass_disk");
  var solar_mass = CONST.get("solar_mass")

  var Nstar = mass/solar_mass;

  var bulge = BULGE(R);

  var rotation_velocity = Math.sqrt(Rkm * (((Nstar*B*c*c*Rkm)/(2*R0km*R0km*R0km)) * bessel_func));

  rotation_velocity = Math.sqrt(rotation_velocity*rotation_velocity + bulge);
  
  return rotation_velocity;
}