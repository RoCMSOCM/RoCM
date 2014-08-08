LATEX = {
	"VROT_GR": "v_{GR} = \\sqrt{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}", 

	"VROT_DARK": "v_{dark} = \\sqrt{4\\pi\\beta^*c^2\\sigma_0\\left[1-\\frac{r_0}{R}\\text{arctan}\\left(\\frac{R}{r_0}\\right)\\right]}",

	"VROT_CONFORMAL": "v_{CG} = \\sqrt{\\genfrac{}{}{0pt}{}{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}{+\\frac{N^*\\gamma^*c^2R^2}{2R_0}I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)+\\frac{\\gamma_0c^2R}{2}-\\kappa c^2R}}",

	"VROT_TOTAL": "v_{total} = \\sqrt{v_{GR}^2 * v_{dark}^2}"};

var new_line = " \\\\\\\\ ";

function display_latex(input_tex, output_id){
	var tex = input_tex;
	$(output_id).html('\\['+tex+'\\]');
	MathJax.Hub.Queue(['Typeset',MathJax.Hub]);

	if(!window.location.origin)
		window.location.origin=window.location.protocol+"//"+window.location.host;
	var url=window.location.origin+window.location.pathname+(tex.length?'?'+encodeURIComponent(tex):'');
	$('#link').text(url).attr('href',url);
} 


$(document).ready(function() {
	var input_id = '#input #tex';
	var output_id = '#output';

	$(input_id).val(LATEX["VROT_GR"] + new_line + LATEX["VROT_CONFORMAL"] + new_line + LATEX["VROT_DARK"] + new_line + LATEX["VROT_TOTAL"]);

	$(function(){
		$(input_id).on('change keyup',function() {
			var input_tex=$(input_id).val();
			display_latex(input_tex, output_id);
		});

		var input_tex=$(input_id).val();
		display_latex(input_tex, output_id);
		if(location.search.length) 
			$(input_id).val(unescape(location.search.slice(1))).change();
	});
});