
LATEX = {
	"VROT_GR": "v_{\\text{GR}} = \\sqrt{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}", 

	"VROT_DARK": "v_{dark} = \\sqrt{4\\pi\\beta^*c^2\\sigma_0\\left[1-\\frac{r_0}{R}\\text{arctan}\\left(\\frac{R}{r_0}\\right)\\right]}",

	"VROT_CONFORMAL": "v_{\\text{CG}} = \\sqrt{\\genfrac{}{}{0pt}{}{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}{+\\frac{N^*\\gamma^*c^2R^2}{2R_0}I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)+\\frac{\\gamma_0c^2R}{2}-\\kappa c^2R}}",

	"VROT_TOTAL": "v_{total} = \\sqrt{v_{GR}^2 * v_{dark}^2}"};

var new_line = " \\\\\\\\ ";

$("#input #tex").val(LATEX["VROT_GR"] + new_line + LATEX["VROT_CONFORMAL"] + new_line + LATEX["VROT_DARK"] + new_line + LATEX["VROT_TOTAL"]);


function display(){
	var tex=$('#input #tex').val();
	$('#output').html('\\['+tex+'\\]');
	MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
	if(!window.location.origin)
		window.location.origin=window.location.protocol+"//"+window.location.host;
	var url=window.location.origin+window.location.pathname+(tex.length?'?'+encodeURIComponent(tex):'');
	$('#link').text(url).attr('href',url);
} 

$(function(){
	$('#input #tex').on('change keyup',display);
	display();
	if(location.search.length) 
		$('#input #tex').val(unescape(location.search.slice(1))).change();
});