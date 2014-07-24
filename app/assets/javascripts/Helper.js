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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/////////////////// MATH HELP ///////////////////

function difference(a, b) {
	return Math.abs(a - b);
}

function chi_squared(obs, exp) {
	return Math.pow(obs - exp, 2) / exp;
}

function formatExponential(exp) {
	if(typeof(exp) !== "number")
		return exp;
	
	var exponential = exp.toExponential(2);
	if(!exponential.contains("e-") && exp < 10000 && exp >= 0)
		return Math.round(exp * 100) / 100;
	else if(exponential.contains("e")) {
		exponential = exponential.replace("+", "");
		return exponential.replace("e", "x10<sup>") + "</sup>";
	}
	else
		return exp;
}

function arcsec_to_kpc(arcsec, Dkpc) {
	var DMpc = Dkpc * 1000;
	var deg2rad = Math.PI/180;
	return DMpc * Math.tan(CONVERT.arcsec_to_degree(arcsec) * deg2rad);
}

function kpc_to_arcsec(kpc, Dkpc) {
	var DMpc = Dkpc * 1000;
	var rad2deg = 180/Math.PI;
	return CONVERT.degree_to_arcsec(Math.atan(kpc/DMpc) * rad2deg);
}

// TODO:
// function distance_to_R(DMpc)

function universal_constant(v_last, R_last) {
	var c = CONVERT.km_to_cm(CONST.get("c"));

	var v = CONVERT.km_to_cm(v_last);
	var R = CONVERT.km_to_cm(CONVERT.kpc_to_km(R_last));

	return (v*v)/(c*c*R) * Math.pow(10,30); // in 10^30 cm^-1
}

function mass_to_stars(mass_disk) {
	var solar_mass = CONST.get("solar_mass");
	return mass_disk / solar_mass;
}


/////////////////// True SOCM Values ///////////////////
// Conversion from formatted SOCM table value, to true value
// (ex: 24.2 ===> 24.2 * 10^10 solar masses)

function true_mass(table_mass) {
	return table_mass * Math.pow(10,10) * CONST.get("solar_mass");
}

function true_luminosity(table_luminosity) {
	return table_luminosity * Math.pow(10,10) * CONST.get("solar_luminosity");
}


/////////////////// superScript Plug-in ///////////////////
$.fn.superScript = function() {
    var chars = '+-=()0123456789AaÆᴂɐɑɒBbcɕDdðEeƎəɛɜɜfGgɡɣhHɦIiɪɨᵻɩjJʝɟKklLʟᶅɭMmɱNnɴɲɳŋOoɔᴖᴗɵȢPpɸrRɹɻʁsʂʃTtƫUuᴜᴝʉɥɯɰʊvVʋʌwWxyzʐʑʒꝯᴥβγδθφχнნʕⵡ',
        sup   = '⁺⁻⁼⁽⁾⁰¹²³⁴⁵⁶⁷⁸⁹ᴬᵃᴭᵆᵄᵅᶛᴮᵇᶜᶝᴰᵈᶞᴱᵉᴲᵊᵋᶟᵌᶠᴳᵍᶢˠʰᴴʱᴵⁱᶦᶤᶧᶥʲᴶᶨᶡᴷᵏˡᴸᶫᶪᶩᴹᵐᶬᴺⁿᶰᶮᶯᵑᴼᵒᵓᵔᵕᶱᴽᴾᵖᶲʳᴿʴʵʶˢᶳᶴᵀᵗᶵᵁᵘᶸᵙᶶᶣᵚᶭᶷᵛⱽᶹᶺʷᵂˣʸᶻᶼᶽᶾꝰᵜᵝᵞᵟᶿᵠᵡᵸჼˤⵯ';

    return this.each(function() {
        this.value = this.value.replace(/<sup[^>]*>(.*?)<\/sup>/g, function(x) {
            var str = '',
                txt = $.trim($(x).unwrap().text());

            for (var i=0; i<txt.length; i++) {
                var n = chars.indexOf(txt[i]);
                str += (n!=-1 ? sup[n] : txt[i]);
            }
            return str;
        });
    });
}