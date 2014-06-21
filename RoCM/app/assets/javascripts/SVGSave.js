function saveSVG(type) {
  submit_download_form(type);
}


function submit_download_form(type){
  // Get the d3.js SVG element
  var tmp = document.getElementById(type);
  var svg_el = tmp.getElementsByTagName("svg")[0];

  // Extract the data as SVG text string
  var svg_xml = (new XMLSerializer).serializeToString(svg_el);

  var form = document.getElementById("svgform");
  form['output_format'].value = 'svg';
  form['data'].value = svg_xml;
  
  var blob = new Blob([svg_xml], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "d3_svg_element.svg");

  // form.submit();
}