function Constants() {
	this.get = function(key) {
		return this[key].value;
	};

	this.setValue = function(key, value) {
		this[key] = new Param(value);
	};

	this.setParam = function(key, param) {
		this.set(key, param);
	};

	this.set = function(key, param) {
		this[key] = param;
	}
};

CONST = new Constants();


// Speed of light
var speed_of_light = new Param(300000, "km/s");
CONST.set("c", speed_of_light);
CONST.set("speed_of_light", speed_of_light);

// Solar mass
var solar_mass = new Param(1.98855 * Math.pow(10,30), "kg");
CONST.set("Mo", solar_mass);
CONST.set("solar_mass", solar_mass);

// Solar luminosity
var solar_luminosity = new Param(3.846 * Math.pow(10, 26), "W");
CONST.set("Lo", solar_luminosity);
CONST.set("solar_luminosity", solar_luminosity);

// Gravitational constant
var gravitational_constant = new Param(6.67 * Math.pow(10,-11), "N(m/kg)^2");
CONST.set("G", gravitational_constant);
CONST.set("gravitational_constant", gravitational_constant);

// Schwarzschild radius
var schwarzschild_radius = new Param(1.48, "km");
CONST.set("B*", schwarzschild_radius);
CONST.set("schwarzschild_radius", schwarzschild_radius);
