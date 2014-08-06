var range_color_white = d3.scale.linear()
  .range(["white", "white"]);

var range_color = d3.scale.linear()
  .range(["#ea051c","#1aaf3a"]);

var range_color2 = d3.scale.linear()
  .range(["#df5223","#000099"]);

var range_color3 = d3.scale.linear()
  .range(["#c50855","#19ca64"]);


var radius_scale = d3.scale.linear()
  .domain([0,100])
  .range([0, 200]);

var size_scale = d3.scale.linear()
  .domain([0,100])
  .range([0.5,2.5]);

var velocity_scale = d3.scale.linear()
  .domain([0, 1])
  .range([0, 2]);

var model_name_map = {
  DATA: "Observational Data",
  GR: "General Relativity",
  TOTAL: "Lambda Cold Dark Matter",
  CONFORMAL: "Conformal Gravity"
}

var MIN_VEL, MAX_VEL;

var VELOCITY_FACTOR = 50;

function create_rocs_page(){
  var url_hash_split = window.location.href.split("#")
  var galaxy_name = localStorage.getItem("galaxy_name");
  // if(galaxy_name === undefined)
      // galaxy_name = "MILKY-WAY"

  var vrot_name = localStorage.getItem("vrot_name");
  
  // create_back_button(galaxy_name);

  var is_data = vrot_name == "DATA";
  var data = get_simulate_data(is_data);

  if(!is_data){
    // Don't simulate_data twice if is_data
    simulate_data(galaxy_name);
  }

  var full_model_name = model_name_map[vrot_name];

  if(full_model_name !== undefined)
      simulate(data, galaxy_name, full_model_name, is_data);  
  else
      simulate(data, galaxy_name, vrot_name, is_data);


  generate_rocs_title(galaxy_name);


  // Creates a ParamTable for the parameters used to model the galaxy
  var param_data = JSON.parse(localStorage.getItem("PARAMS"));

  var filtered_data = filter_parameters(param_data);

  var final_data = convert_param_to_value(filtered_data);

  var table_wrapper_id = "rocs_parameters";
  var table_id = "rocs_param_table";

  $("#" + table_wrapper_id)
    .css("margin", "0 auto")
    .css("width", "50%")
    .append($("<table/>")
      .attr("id", table_id)
      .css("margin", "0 auto")
      .css("cellspacing", "0"));

  create_param_table(table_id, final_data);

  // Remove the update_original call when clicking the param header
  $(".param_table_header").unbind("click");
}

$(document).ready(function() {
  create_rocs_page();

  update_star_color_range();
  initialize_legend(MIN_VEL, MAX_VEL, VELOCITY_FACTOR);
})

function get_simulate_data(is_data) {
  var R = JSON.parse(localStorage.getItem("R"));
  var vrot_storage_name = is_data ? "VROT_DATA" : "VROT";
  var VROT = JSON.parse(localStorage.getItem(vrot_storage_name));
  var data = [];

  R.forEach(function(d, i) {
    if(i != 0)
      data.push({R: R[i], VROT: VROT[i]});
  });

  return data;
}

function simulate_data(galaxy_name) {
  var data = get_simulate_data(true);

  simulate(data, galaxy_name, model_name_map["DATA"]);
}

function simulate(data, galaxy_name, data_type, one_galaxy) {
  initialize_angle_slider()

  var dist_factor = 3;

  var stars = data.map(function(d) {
    return {R: +d.R * dist_factor, r: 1, velocity: +d.VROT/VELOCITY_FACTOR};
  });

  var min_R = d3.min(stars, function(d) { return d.R; });
  var max_R = d3.max(stars, function(d) { return d.R; });

  var min_velocity = d3.min(stars, function(d) { return d.velocity; });
  var max_velocity = d3.max(stars, function(d) { return d.velocity; });

  // For global relative color scale
  MIN_VEL === undefined ? MIN_VEL = min_velocity : MIN_VEL = MIN_VEL;
  MAX_VEL === undefined ? MAX_VEL = max_velocity : MAX_VEL = MAX_VEL;

  MIN_VEL = MIN_VEL < min_velocity ? MIN_VEL : min_velocity;
  MAX_VEL = MAX_VEL > max_velocity ? MAX_VEL : max_velocity;

  size_scale.domain([0, max_R]);
  radius_scale.domain([0, max_R]);

  var is_data = data_type == model_name_map["DATA"];
  var floatstyle = is_data ? "left" : "right";
  var id_suffix;
  id_suffix = is_data ? "DATA" : "VROT";



  var w = 1000, h = w*0.85;


  var div_id = "div_" + id_suffix;
  var svg_id = "svg_" + id_suffix;

  var div = d3.select("#rocs_galaxy")
              .insert("div")
                .attr("id", div_id);


  var svg = div.append("svg")
    .attr("width", one_galaxy ? "100%" : "50%")
    .attr("height", h/2)
    .style("float", floatstyle)
    .style("margin", "auto auto")
    .style("display","block")
    .attr("id", svg_id);

  var is3D = false;

  if(!is3D){
    $("#slider_wrapper").hide();
  }


  var g_id = "g_" + id_suffix;

  var container = svg.append("g")
  .attr("id", g_id);


  initialize_spin_slider();

  insert_star(container, stars, max_R, is3D);

  var star_velocity = stars.map(function(d) {
    return d.velocity;
  });

  var star_cluster = container.selectAll(".star");
  var N_data = star_velocity.length;


  var galaxy_title_div = d3.select("#galaxy_title_div");

  generate_galaxy_title(galaxy_title_div, data_type, is_data, one_galaxy);

  var rotate_galaxy = true;

  var t0 = Date.now() - 10000000;
  if(rotate_galaxy){
    d3.timer(function() {

      rotate(star_cluster, star_velocity, is3D, t0, is_data); 

    }, 0);
  } 
  else
    rotate(star_cluster, star_velocity, is3D, t0, is_data);
}

function insert_star(container, data, max_x, is3D){
  var INSERT_BOUNDRY = true;

  container.selectAll("g.star").data(data).enter()
    .insert("g").each(function(d, i) {
      var star = d3.select(this);
      if(i == 0 && INSERT_BOUNDRY)
      {
        star.insert("circle")
          .attr("class", "orbit")
          .attr("r", radius_scale(max_x))
          .attr("opacity", 1)
          .style("stroke", d3.rgb(60,60,60))
          .style("stroke-dasharray", ("3, 3"));
      }
      for(var i=0;i<1;i++){
        star.insert("circle")
          .attr("class", "star")
          .attr("r", is3D ? 2 : size_scale(d.R)) // > 20 ? 1 : 0.1)
          .attr("cx", radius_scale(d.R))
          .attr("cy", 0+i*d.velocity*1.5)
          .style("stroke", "white")
          .style("fill", "white")
          .attr("class", "star")   
          .attr("opacity", 0.6+i/2)
            .transition()
              // .duration(100000)
              // .ease(Math.sqrt)
              // .attr("r", 10)
              // .remove();
      }
});
}

function update_star_color_range() {
  range_color.domain([MIN_VEL, MAX_VEL]);

  d3.selectAll(".star").each(function(d, i) {
    var star = d3.select(this);
    star.style("stroke", d3.rgb(range_color(d.velocity)).brighter(2) )
        .style("fill", range_color(d.velocity))
  });
}

_spin_velocity = 100;
spin_velocity = _spin_velocity;

function rotate(star_cluster, star_velocity, is3D, t0, is_data){
  var delta = (Date.now() - t0);
  var cx = star_cluster.attr("cx");


  if(is3D){
    star_cluster
    .transition()
    .duration(100000)
    .attr("style", function (d) {
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      return "-webkit-transform: perspective(800) scale(1) scale3d(1, 1, 2) rotate3d(1, 0, 0, " + a_value + "deg) translate3d(0px, 200px, 0px);stroke:none;fill:" + range_color(d.velocity);
    })
  }
  star_cluster.attr("transform",  function(d) {
    if(spin_velocity != 0)
      return "rotate(" + delta * d.velocity/spin_velocity + ")";
    else
      return "rotate(" + d.velocity * Math.pow(10, 1) + ")";
  })


  var id_suffix;
  id_suffix = is_data ? "DATA" : "VROT";

  var g_id = "g_" + id_suffix;
  var svg_id = "svg_" + id_suffix;
  var svg = d3.select("#" + svg_id);

  var w = +(svg.style("width").replace("px", ""));
  var h = +(svg.style("height").replace("px", ""));

  $("#" + g_id).attr("transform", "translate(" + w/2 + "," + h/2 + ")")

}


function convert_param_to_value(data) {
  // Turn the filtered_data object into 
  // param_name: value, instead of param_name: Param
  var keys = Object.keys(data);
  var new_data = {};

  for(var i=0;i<keys.length;i++) {
    var k = keys[i];
    new_data[k] = data[k].value;
  }

  return new_data;
}

// 3D Slider settings

a_init = 66; // global initial 3D perspective angle
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
  var vmin = vmin*velocity_factor;
  var vmax = vmax*velocity_factor;
  var vmid = (vmax+vmin)/2;

  $( "#velocity_value_min" ).val( Math.round(vmin) + " km/s" );
  $( "#velocity_value_min" ).css('color',range_color(vmin/velocity_factor));

  $( "#velocity_value_mid" ).val( Math.round(vmid) + " km/s" );
  $( "#velocity_value_mid" ).css('color',range_color(vmid/velocity_factor));

  $( "#velocity_value_max" ).val( Math.round(vmax) + " km/s" );
  $( "#velocity_value_max" ).css('color',range_color(vmax/velocity_factor));
}

function update_original_speed(type) {
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

function generate_rocs_title(galaxy_name, data_type) {

  d3.select("#title_div")
  .append("h3")
  .append("font")
  .attr("color", "white")
  .text("Rotation Curve Simulation: " + galaxy_name + " Galaxy");

  d3.select("#title_div")
  .append("h2")
  .text(" ");



  $("#title_div").append($("<thead><tr>"));
}

function generate_galaxy_title(div, data_type, is_data, one_galaxy) {
  var floatstyle = is_data ? "left" : "right";

  div.append("div") 
  .style("float", floatstyle)
  .style("text-align", "center")
  .style("width", one_galaxy ? "100%" : "50%")
  .insert("font")
    .attr("color", "white")
    .text(data_type);
}

function create_back_button(galaxy_name) {
  var back_id = "back_button";

  $("#button_div").append(
    $("<button>")
      .attr("id", back_id)
      .attr("position", "absolute")
      .attr("left", "78%")
      .attr("z-index", "10")
      .text("Back to RoCM"));    
    
  $("#" + back_id).button({
    icons: {
      primary: "ui-icon-arrowreturnthick-1-w"
    }
  }).click(function() {
    back(galaxy_name);
  });
}

function back(){
  var galaxy_name = localStorage.getItem("galaxy_name");

  var rocm_url = window.location.href.replace("rocs/index", "");
  window.location.href = rocm_url + "#GALAXY=" + galaxy_name;
}