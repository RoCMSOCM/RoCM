function Params() {
	// Default constructor
	this.R0kpc = 0;
	this.Nstar = 0;
	this.r0 = 0;
	this.sigma0 = 0;
}

function Params(R0kpc, Nstar, r0, sigma0) {
	this.R0kpc = R0kpc;
	this.Nstar = Nstar;
	this.r0 = r0;
	this.sigma0 = sigma0;
}

Params.prototype = {

}