
LATEX = {
	"VROT_GR": "v_{\\text{GR}} = \\sqrt{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}", 

	"VROT_DARK": "v_{dark} = \\sqrt{4\\pi\\beta^*c^2\\sigma_0\\left[1-\\frac{r_0}{R}\\text{arctan}\\left(\\frac{R}{r_0}\\right)\\right]}",

	"VROT_CONFORMAL": "v_{\\text{CG}} = \\sqrt{\\genfrac{}{}{0pt}{}{\\frac{N^*\\beta^*c^2R^2}{2R^3_0}\\left[I_0\\left(\\frac{R}{2R_0}\\right)K_0\\left(\\frac{R}{2R_0}\\right)-I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)\\right]}{+\\frac{N^*\\gamma^*c^2R^2}{2R_0}I_1\\left(\\frac{R}{2R_0}\\right)K_1\\left(\\frac{R}{2R_0}\\right)+\\frac{\\gamma_0c^2R}{2}-\\kappa c^2R}}"}


$("#input #tex").val(LATEX["VROT_GR"] + " \\\\\\\\ " + LATEX["VROT_CONFORMAL"] + " \\\\\\\\ " + LATEX["VROT_DARK"]);


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