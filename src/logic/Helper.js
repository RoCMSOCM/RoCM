function sleep(millis, callback) {
	setTimeout(function()
		{ callback(); }
		, millis);
}

function formatting(string) {
	return string.replace("&gt;", />/g).replace("&lt;", /</g);
}

function is(d, string) {
	return d.name ? d.name.toLowerCase().contains(string) : d.toLowerCase().contains(string);
}

String.prototype.contains = function(value) {
	return this.indexOf(value) != -1;
}

String.prototype.prefix = function(value) {
	return this.indexOf(value);
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function println(p) {
	console.log(p);
}

function difference(a, b) {
	return Math.abs(a - b);
}

function chi_squared(obs, exp) {
	return Math.pow(obs - exp, 2) / exp;
}

function formatExponential(exp) {
	var exponential = exp.toExponential(2);
	if(exponential.contains("e+0"))
		return Math.round(exp * 100) / 100;
	else
		return exponential.replace("e+", "x10<sup>") + "</sup>";
}

function arcsec_to_kpc(arcsec, Dkpc) {
	var deg2rad = Math.PI/180;
	return Dkpc * Math.tan(CONVERT.arcsec_to_degree(arcsec) * deg2rad);
}

function kpc_to_arcsec(kpc, Dkpc) {
	var rad2deg = 180/Math.PI;
	return CONVERT.degree_to_arcsec(Math.atan(kpc/Dkpc) * rad2deg);
}