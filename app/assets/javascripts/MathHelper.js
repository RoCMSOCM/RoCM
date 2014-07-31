/////////////////// MATH HELP ///////////////////

function difference(a, b) {
	return Math.abs(a - b);
}

function chi_squared(obs, exp) {
	return Math.pow(obs - exp, 2) / exp;
}

//TODO: Numbers between 0-1 (starting at 0.001 or 1.0e-3)
function formatExponential(exp) {
	if(typeof(exp) !== "number")
		return exp;
	
	var exponential = exp.toExponential(2);
	if(!exponential.contains("e-") && exp < 10000 && exp >= 0)
		return Math.round(exp * 10000) / 10000;
	else if(exponential.contains("e+")) {
		return exponential.replace("e+", "x10<sup>") + "</sup>";
	}
	else if(exponential.contains("e-") && exp < 0.01 && exp >= 0)
		return exponential.replace("e-", "x10<sup>-") + "</sup>";
	else
		return Math.round(exp * 100000) / 100000;
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


// Distance calculations

function arcsec_to_kpc(arcsec, DMpc) {
	var Dkpc = CONVERT.Mpc_to_kpc(DMpc);
	var deg2rad = Math.PI/180;
	return Dkpc * Math.tan(CONVERT.arcsec_to_degree(arcsec) * deg2rad);
}

function kpc_to_arcsec(kpc, DMpc) {
	var DMpc = CONVERT.Mpc_to_kpc(DMpc);
	var rad2deg = 180/Math.PI;
	return CONVERT.degree_to_arcsec(Math.atan(kpc/DMpc) * rad2deg);
}

function stellar_surface_matter_density(R, scale_length) {
	var Sigma0 = 1;

	return Sigma0 * Math.pow(e, -(R/scale_length));
}

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

function calculate_schwarzschild_radius(mass_disk) {
	var G = CONST.get("G"); // Gravitational constant in N(m/kg)^2
	var c = CONVERT.km_to_m(CONST.get("c")); // Speed of light in m

	var m = mass_disk; // Mass of galaxy in kg

	var s_radius = (2 * m * G) / Math.pow(c, 2);

	return s_radius;
}