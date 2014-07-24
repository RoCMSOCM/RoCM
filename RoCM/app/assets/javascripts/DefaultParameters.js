function initialize_default_parameters(){
	// Default Lambda-CDM values come from the Milky Way
	// Lambda-CDM Halo Radius
	PARAMS.add("r0", new Param(5.29, "kpc", 0, 100));
	// Lambda-CDM Dark Matter Density
	PARAMS.add("sigma0", new Param(1.3e-7, "GeV cm^-3", 1.0*Math.pow(10,-10), 1.0*Math.pow(10,-6)));


	// TODO: Calculate it.
	// Schwarzchild radius
	PARAMS.add("B", new Param(1.48, "km"));

	var bulge_b = 0.611499 // *10^10
	var bulge_t = 0.0939927
	PARAMS.add("bulge_b", new Param(bulge_b)) // *10^10
	PARAMS.add("bulge_t", new Param(bulge_t))
}