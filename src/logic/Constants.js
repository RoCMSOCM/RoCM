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
CONST.set("c", 300000); //km
var solar_mass = 1.98855 * Math.pow(10,30)
CONST.set("Mo", solar_mass) //kg
CONST.set("solar_mass", solar_mass) //kg