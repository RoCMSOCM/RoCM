var w = 1500, h = w*0.85,
AU = 100,
days = 36.5, 
spScale = 100 * 5, 
dist = 1 / 5, 
sizeScale = dist,
black_hole_size = 1;

var myGlow = glow("myGlow").rgb("#ff0").stdDeviation(.2);

var color = d3.scale.linear()
  .range(["gold","firebrick"]);

var range_color = d3.scale.linear()
  .range(["#ea051c","#1aaf3a"]);

var range_color2 = d3.scale.linear()
  .range(["#df5223","#000099"]);

var range_color3 = d3.scale.linear()
  .range(["#c50855","#19ca64"]);

var size_scale = d3.scale.linear()
  .domain([0,100])
  .range([0.8,2])

AU *= dist;

$("#back").button({
  icons: {
    primary: "ui-icon-arrowreturnthick-1-w"
  }
});

// $("input").bind("keyup",function(e){
//		 var value = this.value + String.fromCharCode(e.keyCode);
// });

d3.csv("../data/velocity/MILKY_WAY_OUTPUT.csv", function(error, data) {
  var hash_split = window.location.href.split("#")
  var galaxy_name = hash_split[1];
  var vrot_name = hash_split[2];

  switch(vrot_name) {
    case "VROT_DATA":
      simulate(data, vrot_name, galaxy_name, "Observational Data");	 
      break;
    case "VROT_GR":
      simulate(data, vrot_name, galaxy_name, "General Relativity");
      break;
    case "VROT_TOTAL":
      simulate(data, vrot_name, galaxy_name, "Lambda Cold Dark Mater");
      break;
    case "VROT_CONFORMAL":
      simulate(data, vrot_name, galaxy_name, "Conformal Gravity");
      break;
    default:
      simulate(data, "VROT_DATA", galaxy_name, "Observational Data");
  } 

});

function simulate(data, velocity, galaxy_name, data_type) {

  generate_title(galaxy_name, data_type);

  initialize_angle_slider()

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "R"; }));

  dist_factor = 3;

  var velocity_factor = 50;

  var stars = data.map(function(d) {
    return {R: +d.R * dist_factor, r: 1, velocity: +d[velocity]/velocity_factor};
  });

  var min_R = d3.min(stars, function(d) { return d.R; });
  var max_R = d3.max(stars, function(d) { return d.R; });

  var min_velocity = d3.min(stars, function(d) { return d.velocity; });
  var max_velocity = d3.max(stars, function(d) { return d.velocity; });


  var cluster_scale = d3.scale.linear()
  .domain([0, max_R])
  .range([0.1, 2]);

  var svg = d3.select("#milky_way_galaxy").insert("svg")
  .attr("width", w/2).attr("height", h/2).style("margin", "auto").style("display","block")
  .call(myGlow);

  svg.append("circle").attr("r", black_hole_size * sizeScale).attr("cx", w/4)
  .attr("cy", h/4).attr("class", "black_hole");


  var is3D = false;

  if(!is3D){
    $("#slider_wrapper").hide();
  }

  var h_factor = is3D ? 8 : 4;

  var container = svg.append("g")
  .attr("transform", "translate(" + w/4 + "," + h/h_factor + ")")

  range_color.domain([min_velocity, max_velocity]);

  initialize_spin_slider();

  initialize_legend(min_velocity, max_velocity, velocity_factor);

  container.selectAll("g.star").data(stars).enter().append("g")
  .attr("class", "star").each(function(d, i) {
    if(i == 0)
    {
      d3.select(this).append("circle")
      .attr("class", "orbit")
      .attr("r", max_R)
      .attr("opacity", 1)
      .style("fill", "black")
      .style("stroke", "dimgray")
      .style("stroke-dasharray", ("3, 3"));

    }
    d3.select(this).append("circle")
      .attr("r", size_scale(d.R))// > 20 ? 1 : 0.1)
        .attr("cx", d.R)
        .attr("cy", 0)
        .style("stroke", "none")
        .style("fill", range_color(d.velocity))
        .attr("class", "star")	 
      //.style("filter", "url(#myGlow)");

});



  var star_velocity = stars.map(function(d) {
    return d.velocity;
  });

  var rotate_galaxy = true;

  star_cluster = svg.selectAll(".star");
  var N_data = star_velocity.length;

  if(rotate_galaxy){
    d3.timer(function() {
      rotate(star_cluster, star_velocity,is3D); 
    }, 0);
  } 
  else
    rotate(star_cluster, star_velocity,is3D);



}

var t0 = Date.now() - 10000000;
_spin_velocity = 100;
spin_velocity = _spin_velocity;

function rotate(star_cluster, star_velocity, is3D){
  var delta = (Date.now() - t0);
  var cx = star_cluster.attr("cx");


  if(is3D){
    star_cluster
    .transition()
    .duration(10)
    .attr("style", function (d) {
      return "-webkit-transform: perspective(800) scale(1) scale3d(1, 1, 2) rotate3d(1, 0, 0, " + a_value + "deg) translate3d(0px, 198px, 0px);stroke:none;fill:" + range_color(d.velocity);
    })
  }
  star_cluster.attr("transform",	function(d) {
    return "rotate(" + delta * d.velocity/spin_velocity + ")";
  });
}

a_init = 55; // global initial 3D perspective angle
a_value = a_init; // global dynamic value for 3D perspective angle
function initialize_angle_slider() {

  a_min = 1;
  a_max = 90;
  a_value = a_init; // global a_init

$( "#slider_angle" ).slider({
  orientation: "vertical",
  range: "min",
  min: a_min,
  max: a_max,
  value: a_value,
  slide: function( event, ui ) {
    slide_slider( event, ui, "angle" );
  },
  change: function( event, ui ) {
    slide_slider( event, ui, "angle" );
  }
});

$( "#angle_value" ).val( a_value + " degrees" );
}

function initialize_spin_slider() {

  $( "#slider_spin" ).slider({
    range: "min",
    min: spin_velocity/4,
    max: spin_velocity*2,
    value: spin_velocity,
    change: function( event, ui ) {
      spin_velocity = +ui.value;
    }
  });

}

function slide_slider(event, ui, type) {
  var local_val = +ui.value;

  if(type == "angle"){
    $( "#angle_value" ).val( local_val + " degrees");

    a_value = local_val;
  }

}

function initialize_legend(vmin, vmax, velocity_factor) {
  vmin = vmin*velocity_factor;
  vmax = vmax*velocity_factor;
  vmid = (vmax+vmin)/2

  $( "#velocity_value_min" ).val( Math.round(vmin) + " km/s" );
  $( "#velocity_value_min" ).css('color',range_color(vmin/velocity_factor));

  $( "#velocity_value_mid" ).val( Math.round(vmid) + " km/s" );
  $( "#velocity_value_mid" ).css('color',range_color(vmid/velocity_factor));

  $( "#velocity_value_max" ).val( Math.round(vmax) + " km/s" );
  $( "#velocity_value_max" ).css('color',range_color(vmax/velocity_factor));
}

function update_original(type) {
  var orig_val = 0;
  var val_suffix = "";

  if(type == "angle"){
    orig_val = a_init;
    val_suffix = " degrees";
  }
  else if(type == "spin"){
    spin_velocity = _spin_velocity;
    orig_val = spin_velocity;
  }

  var slider_name = "#slider_" + type;

  $slider = $(slider_name);
  $slider.slider("value", orig_val);
  $slider.trigger("change");
}

function generate_title(galaxy_name, data_type) {

  d3.select("#title_div")
  .append("h3")
  .append("font")
  .attr("color", "white")
  .text("Rotation Curve Simulation: " + galaxy_name + " Galaxy");

  d3.select("#title_div")
  .append("font")
  .attr("color", "white")
  .text("Using " + data_type);

  d3.select("#title_div")
  .append("h2")
  .text(" ");



  $("#title_div").append($("<thead><tr>"));
}

function back(){
  var rocm_url = "./RoCM.html";
  window.location.href = rocm_url;
}