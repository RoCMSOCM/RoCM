function Constants() {
	this.get = function(key) {
		return this[key];
	};

	this.set = function(key, value) {
		this[key] = value;
	};
};

CONST = new Constants();



// Speed of light
CONST.set("c", 300000); //km/s

// Solar mass
var solar_mass = 1.98855 * Math.pow(10,30)
CONST.set("Mo", solar_mass) // kg
CONST.set("solar_mass", solar_mass) // kg

// Solar luminosity
var solar_luminosity = 3.846 * Math.pow(10, 26) // W
CONST.set("Lo", solar_luminosity);
CONST.set("solar_luminosity", solar_luminosity);

// Gravitational constant
var gravitational_constant = 6.67 * Math.pow(10,-11); // N(m/kg)^2
CONST.set("G", gravitational_constant);
CONST.set("gravitational_constant", gravitational_constant);
