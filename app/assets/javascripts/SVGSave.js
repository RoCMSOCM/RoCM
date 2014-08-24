function saveSVG(type) {
  // Get the d3.js SVG element
  var tmp = document.getElementById(type);
  var svg_el = tmp.getElementsByTagName("svg")[0];

  var transformed_svg = svg_el.cloneNode(true);

  transformed_svg.style.position = "absolute";
  transformed_svg.style.left = "0px";
  transformed_svg.style.top = "0px";

  // Extract the data as SVG text string
  var svg_xml = (new XMLSerializer).serializeToString(transformed_svg);

  var form = document.getElementById("svgform");
  form['output_format'].value = 'svg';
  form['data'].value = svg_xml;

  var galaxy_name = PARAMS.getValue("galaxy_name");

  var blob = new Blob([svg_xml], {type: "text/plain;charset=utf-8"});
  saveAs(blob, galaxy_name + ".svg");
}