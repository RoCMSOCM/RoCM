function initialize_default_parameters(){
	// Default Lambda-CDM values come from the Milky Way

	// Lambda-CDM Halo Radius (r0)
	add_param("dark_halo_radius", "r<sub>0</sub>", new Param(5.29, "kpc", 0, 100));
	// Lambda-CDM Dark Matter Density (sigma0)
	add_param("dark_matter_density", "σ<sub>0</sub>", new Param(1.3e-7, "GeV cm<sup>-3</sup>", 1.0*Math.pow(10,-10), 1.0*Math.pow(10,-6)));



	// TODO: bulge full names and units
	var bulge_b = 0.611499 // *10^10
	var bulge_t = 0.0939927
	add_param("bulge_b", "Bulge<sub>b</sub> fitting", new Param(bulge_b)) // *10^10
	add_param("bulge_t", "Bulge<sub>t</sub> fitting", new Param(bulge_t));





	// TODO: Calculate it.
	// Schwarzchild radius
	add_param("schwarzschild_radius", "β<sup>*</sup>", new Param(1.48, "km"));
}
;
