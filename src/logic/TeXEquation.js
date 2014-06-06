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