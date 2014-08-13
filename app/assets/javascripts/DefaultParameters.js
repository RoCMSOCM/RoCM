function initialize_default_parameters(){
	// Default Lambda-CDM values come from the Milky Way

	// Lambda-CDM Halo Radius (r0)
	add_param(
		"dark_halo_radius", 
		"r<sub>0</sub>", 
		new Param(5.29, "kpc", 1, 0, 40));
	// Lambda-CDM Dark Matter Density (sigma0)
	add_param(
		"dark_matter_density", 
		"σ<sub>0</sub>", 
		new Param(1.3, "10<sup>-7</sup> GeV cm<sup>-3</sup>", Math.pow(10,-7)));


	var mass_bulge = 0.91656 // 10^10
	var scale_length_bulge = 0.10534
	add_param(
		"mass_bulge",
		"M<sub>Bulge</sub>", 
		new Param(mass_bulge, "10<sup>10</sup> M<sub>☉</sub>"));
	add_param(
		"scale_length_bulge", 
		"R0<sub>Bulge</sub>", 
		new Param(scale_length_bulge, "kpc"));


	// Observed inclination angle
	var inclination_angle = 89.999;
	add_param(
		"inclination_angle",
		"θ<sub>i</sub>",
		new Param(inclination_angle, "°", 1, 0.001, 89.999));
}