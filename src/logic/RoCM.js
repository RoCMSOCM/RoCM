// Our Sun's distance to the galactic center
var d_sun = 8.33 //+- 0.35 kpc

var font = "12px sans-serif";
document.getElementById("graph").style.font = font;

$("#save").button();

var margin = {top: 20, right: 125, bottom: 30, left: 40},
    width = 1050 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y%m%d").parse;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
  .range(["black"])

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.area()
    .interpolate("monotone")
    .tension([0.1])
    .x(function(d) { return x(d.R); })
    .y(function(d) { return y(d.v); })
    .y0(function(d) { return y(d.y0); });

var xy_line = d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

var svg = d3.select("#graph_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var wrapper = d3.select("#wrapper")
    .attr("width", "75%")
    .attr("min-width", width + margin.left + margin.right + 200);

var animate_beginning = true;
var time = 0;

if(animate_beginning)
  time = 7500;

var err_op = 1.0; // Error opacity

var sun_op = 1.0;

var sun_class = "SUN"

var sun_label = "Sun"

var title_text = "Rotation curve of the Milky Way Galaxy";

var bulge_b = 0.611499 // *10^10
var bulge_t = 0.0939927

var calc_done = false;

var blackOrWhite = "black"

var hide_legend_labels = true;



import_constants();




d3.csv("http://localhost:8888/data/MILKY_WAY_OUTPUT.csv", function(error, data) {
  // Add origin to the data
  var data_keys = Object.keys(data[0]);
  var origin_data = {};

  for(var k=0;k<data_keys.length;k++){
    origin_data[data_keys[k]] = 0.000000001;
  }
  data.unshift(origin_data);
  

  color.domain(d3.keys(data[0]).filter(function(key) { 
    return key !== "R" && !key.contains("R_ERR"); 
  }));


  var data_size = data.length;
  
  //Defines global array of Galactocentric distance, R (kpc)
  Rkpc = Array(data_size);

  for(var i=0;i<data_size;i++){
    Rkpc[i] = +data[i].R;
  }

  data.forEach(function(d) {
    d.R = +d.R;
  });

  _data = data;
  
  var velocities = update_velocities(data);

  var vel_size = Object.keys(velocities).length;
  var data_size = velocities[0].values.length;
  VROT_GR_GLOBAL = Array(data_size);
  VROT_DARK_GLOBAL = Array(data_size);

  for(var i=0;i<vel_size;i++){
    if(velocities[i].name == "VROT_GR"){
      for(var j=0;j<data_size;j++){
        VROT_GR_GLOBAL[j] = velocities[i].values[j].v;
      }
    }
    else if(velocities[i].name == "VROT_DARK"){
      for(var j=0;j<data_size;j++){
        VROT_DARK_GLOBAL[j] = velocities[i].values[j].v;
      }
    }
  }

  x.domain(d3.extent(data, function(d) { return d.R; }));

  //x.domain([0,100])
  
  var ymin = d3.min(velocities, function(c) { return d3.min(c.values, function(v) { return v.v; }); });

  var ymax = 400; //d3.max(velocities, function(c) { return d3.max(c.values, function(v) { return v.v; }); });

  y.domain([ymin, ymax + ymax/4]);

  svg.append("g")
      .attr("class", "x axis")
      .style("fill", blackOrWhite)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 150)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("font", font)
      .style("fill", blackOrWhite)
      .text("Galactocentric Distance (kpc)")
      .transition()
        .duration(time*(3/4))    
        .attr("x", width);

  svg.append("g")
      .attr("class", "y axis")
      .style("fill", blackOrWhite)
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -height + 150)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font", font)
      .style("fill", blackOrWhite)
      .text("Rotational Velocity (km/s)")
      .transition()
        .duration(time*(3/4))    
        .attr("x", 0);

  svg.selectAll(".domain")
    .style("fill", "none")
    .style("stroke", blackOrWhite)
    .style("shape-rendering", "middle");

  svg.selectAll(".tick")
    .style("font", font)
    .style("font-weight", "bold")
  .selectAll("line")
    .style("font-weight", "bold")
    .style("stroke", "#000")

  var SHOW_DATA_LINE = false;

  var ERR_BAR = true;

  var d_sun_line = [
          {x:d_sun, y:y.domain()[0]},
          {x:d_sun, y:y.domain()[1]}
        ];
  svg.append("path")
    .datum(d_sun_line)
    .attr("class", sun_class)
    .attr("d", xy_line)
    .style("stroke-dasharray", ("6, 3"))
    .style("stroke", get_colors("sun"))
    .style("fill", "none")
    .style("opacity", get_opacity("sun"));
  
  var sun_text = svg.append("text")
    .attr("class", sun_class)
    .attr("x", x(d_sun_line[1].x))             
    .attr("y", y(d_sun_line[1].y))
    .attr("text-anchor", "middle")  
    .style("font", font)
    .style("font-size", "0px") 
    .style("stroke", get_colors("sun"))
    .style("opacity", get_opacity("sun"))
    .text(sun_label);

  sun_text.transition()
    .duration(time*(3/4)) 
    .style("font-size", "12px");


  x_err = 0.2
  if(ERR_BAR){
    for(var i=0;i<data.length;i++){
        var err_y = [
          {x:data[i].R, y:data[i].VROT_DATA_ERR_MAX},
          {x:data[i].R, y:data[i].VROT_DATA_ERR_MIN}
        ];
        svg.append("path")
          .datum(err_y)
          .attr("class", "VROT_DATA_ERR")
          .attr("d", xy_line)
          .style("fill", "none")
          .style("stroke", get_colors("err"))
          .style("stroke-width", "1.5px")
          .style("opacity", err_op);   

        var err_x_south = [
          {x:data[i].R-x_err, y:err_y[0].y},
          {x:data[i].R+x_err, y:err_y[0].y}
        ];
        svg.append("path")
          .datum(err_x_south)
          .attr("class", "VROT_DATA_ERR")
          .attr("d", xy_line)
          .style("fill", "none")
          .style("stroke", get_colors("err"))
          .style("stroke-width", "1.5px")
          .style("opacity", err_op);

        var err_x_north = [
          {x:data[i].R-x_err, y:err_y[1].y},
          {x:data[i].R+x_err, y:err_y[1].y}
        ];
        svg.append("path")
          .datum(err_x_north)
          .attr("class", "VROT_DATA_ERR")
          .attr("d", xy_line)
          .style("fill", "none")
          .style("stroke", get_colors("err"))
          .style("stroke-width", "1.5px")
          .style("opacity", err_op);
      }
    }

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "VROT_DATA")
        .attr("r", 2)
        .attr("cx", function(d) { return x(d.R); })
        .attr("cy", function(d) { return y(d.VROT_DATA); })
        .style("fill", get_colors("data"))
        .append("title")
          .text(function(d) { return "(" + d.R + ", " + d.VROT_DATA + ")"; });

  velocity = svg.selectAll(".velocity")
      .data(velocities)
    .enter().append("g")
      .attr("class", "velocity");


  velocity.append("path")
      .attr("class", function(d) { return d.name; })
      .attr("d", function(d) { return !SHOW_DATA_LINE && d.name.contains("DATA") ? null : line(d.values); })
      .style("stroke", function(d) { return get_colors(d); })
      .style("stroke-width", 1.5)
      .style("fill", "none")
      .style("opacity", function(d) { return get_opacity(d); })
      .attr("stroke-dasharray", function(d,i) { return is(d, "data") ? "0 0" : children_length(velocity, i) + " " + children_length(velocity, i)*2; } )
      .attr("stroke-dashoffset", function(d,i) {return is(d, "data") ? "0 0" :  children_length(velocity, i); } )
      .transition()
        .duration(time)
        .ease("monotone")
        .style("fill", function(d, i) { return is(d, "err") ? "red" : "none"; })
        .attr("stroke-dasharray", function(d,i) { return is(d, "data") ? "0 0" :  children_length(velocity, i) + " " + children_length(velocity, i)*2; } )
        .attr("stroke-dashoffset", function(d,i) { return 0; })
        .each("end", function(d, i) { var dash_o = d.name.contains("vel") ? 8 : 0;
                                   var dash_a = d.name.contains("vel") ? ("9","3") : children_length(velocity, i);;
                                   this.setAttribute("stroke-dasharray", dash_a); 
                                   this.setAttribute("stroke-dashoffset", dash_o); } )

  var leg_width = 18;
  var leg_offset = 50;
  var legend_item_vertical_offset = 25;
  var legend_width_factor = 2;

  var legend_data = velocities.filter(function(d) {
        return !is(d, "min");
  });
  
  //Add sun to the legend data
  legend_data.push({name:sun_class})
  
  var legend = svg.selectAll(".legend")
      .data(legend_data)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * legend_item_vertical_offset + ")"; });

  legend.append("rect")
      .attr("class", function(d) { return d.name + "_legend_rect"; })
      .attr("x", (width-leg_offset) - leg_width*legend_width_factor - 5)
      .attr("y", -leg_width/2)
      .attr("width", leg_width*legend_width_factor)
      .attr("height", leg_width)
      .style("opacity", 1.0)
      .style("fill", function(d) { return get_colors(d); })
      .style("stroke", function(d) { return d3.rgb(get_colors(d)).darker(2); })
      .on("click", function(d) { 
        var object_class = is(d, "err") ? "VROT_DATA_ERR" : d.name;
        object_opacity(object_class);
      })
      .on("contextmenu", function(d, index) {
        //handle right click
        var object_class = is(d, "err") ? "VROT_DATA_ERR" : d.name;
        var object = svg.selectAll("."+object_class);
        object.style("opacity", 0);

        var this_name = d.name;
        var this_index = index;
        var this_rect_class = "." + this_name + "_legend_rect";
        var this_text_class = "." + this_name + "_legend_text";

        svg.select(this_rect_class).remove();
        svg.select(this_text_class).remove();

        legend_data.forEach(function(d, i) {
          if(this_index < i){
            // Removes the items below the right-clicked from the legend.
            var below_rect_name = "." + d.name + "_legend_rect";
            var below_text_name = "." + d.name + "_legend_text";


            var this_y = d3.transform(svg.select(below_rect_name).attr("transform")).translate[1];

            svg.select(below_rect_name).attr("transform", "translate(0," +  (-legend_item_vertical_offset+this_y) + ")");
            svg.select(below_text_name).attr("transform", "translate(0," + (-legend_item_vertical_offset+this_y) + ")");
          }
        });

        //stop showing browser menu
        d3.event.preventDefault();
      });

  legend.append("text")
      .attr("x", (width-leg_offset) + 2)
      .attr("y", 1)
      .attr("dy", ".35em")
      .attr("class", function(d) { return d.name + "_legend_text"; })
      .style("font", font)
      .style("font-style", "italic")
      .style("user-select", "none")
      .style("-moz-user-select", "none") 
      .style("-webkit-user-select", "none") 
      .style("-ms-user-select", "none")
      .style("fill", blackOrWhite)
      .text(function(d) { return legend_name(d.name); })
      .on("click", function(d) {
        var object_class = is(d, "err") ? "VROT_DATA_ERR" : d.name;
        object_opacity(object_class);
      });

  var show_title = true;
  var animate_title = false;

  if(show_title){
    var title = svg.append("text")
      .attr("class", "title")
      .attr("x", (width / 2))             
      .attr("y", animate_title ? 220 : 0)
      .attr("text-anchor", "middle")  
      .style("font", font)
      .style("font-size", animate_title ? "40px" : "14px") 
      .style("font-style", "italic")
      .style("text-decoration", "underline")
      .style("fill", blackOrWhite)
      .text(title_text);

    if(animate_title){
      title.transition()
        .duration(time*(3/4)) 
        .style("font-size", "14px") 
        .attr("y", 0);
    }
  }
});

function get_colors(d) {
  c_data = "brown"
  c_error = "#edd4d4"
  c_dark = "#f6931f"
  c_total = "black"
  c_sun = "cadetblue"
  c_gr = "green"
  c_bulge = "purple"
  c_default = "orange"
  c_conformal = "navy"

   return is(d, "err") ? c_error : is(d, "data") ? c_data : is(d, "dark") ? c_dark : is(d, "total") ? c_total : is(d, "sun") ? c_sun : is(d, "gr") ? c_gr : is(d, "bulge") ? c_bulge: is(d, "conformal") ? c_conformal : c_default;
}

function get_opacity(d) {
  o_data = 1
  o_error = err_op
  o_dark = 0
  o_total = 1
  o_sun = sun_op
  o_gr = 1
  o_bulge = 0
  o_default = 1
  o_conformal = 1

   return is(d, "err") ? o_error : is(d, "data") ? o_data : is(d, "dark") ? o_dark : is(d, "total") ? o_total : is(d, "sun") ? o_sun : is(d, "gr") ? o_gr : is(d, "bulge") ? o_bulge: is(d, "conformal") ? o_conformal : o_default;
}

function legend_name(d) {
  var lambda = '&#923;';
  var numeric = /\d+/.exec(lambda);
  var lambda_decoded = String.fromCharCode(numeric);

  ln_data = "Observed Data"
  ln_error = "Observed Data Error"
  ln_dark = "Dark Matter (" + "Λ" + "CDM)"
  ln_total = "Total = (GR + " + "Λ" + "CDM)"
  ln_sun = "Sun"
  ln_gr = "General Relativity (GR)"
  ln_bulge = "Galactic Bulge"
  ln_conformal = "Conformal Gravity"
  ln_default = "---NO NAME---"

   return is(d, "err") ? ln_error : is(d, "data") ? ln_data : is(d, "dark") ? ln_dark : is(d, "total") ? ln_total : is(d, "sun") ? ln_sun : is(d, "gr") ? ln_gr : is(d, "bulge") ? ln_bulge: is(d, "conformal") ? ln_conformal : ln_default;
}

function import_constants() {
  d3.csv("http://localhost:8888/data/MILKY_WAY_CONSTANTS.csv", function(error, data) {
    data = data[0];

    //Defines globals r0, sigma0, R0, and N* from the constants CSV
    r0 = +data.r0.split(" ")[0];
    sigma0 = +data.sigma0.split(" ")[0];
    R0kpc = +data.R0.split(" ")[0];
    Nstar = +data["N*"];

    r0_orig = r0;
    sigma0_orig = sigma0;
    R0kpc_orig = R0kpc;
    Nstar_orig = Nstar;


    var keys = Object.keys(data);
    var n = keys.length;

    var table = $("#constants_table");
    
    table.append($("<thead><tr>"));
    
    table = $('#constants_table tr:last');
    for(var i=0;i<n;i++){
      
      table.append($("<th>")
        .text(keys[i]));
    }


    // table.append($("</tr></thead>"));
    table = $('#constants_table');
    table.append($("<tbody><tr>"));

    table = $('#constants_table tr:last');

    for(var i=0;i<n;i++){    
      
      table.append($("<td><em>")
          .text(data[keys[i]])
      );
    }

    initialize_sliders();
  });
}

function initialize_sliders() {
  r0_min = 0.25;
  r0_max = 100.0;
  r0_value = r0;
  r0_coeff = 100;

  $("#slider_r0").slider({
    range: "min",
    value: r0_value*r0_coeff,
    min: r0_min*r0_coeff,
    max: r0_max*r0_coeff,
    slide: function( event, ui ) {
      slide_r0_slider( event, ui );
    },
    change: function( event, ui ) {
      slide_r0_slider( event, ui );
    }
  });
  $( "#r0_amount" ).val( r0_value + " kpc" );

  sigma0_min = 1.0*Math.pow(10,-10);
  sigma0_max = 1.0*Math.pow(10,-6);
  sigma0_value = sigma0;
  sigma0_coeff = sigma0_min;

  $( "#slider_sigma0" ).slider({
    range: "min",
    min: sigma0_min/sigma0_coeff,
    max: sigma0_max/sigma0_coeff,
    value: sigma0_value/sigma0_coeff,
    slide: function( event, ui ) {
      slide_sigma0_slider( event, ui );
    },
    change: function( event, ui ) {
      slide_sigma0_slider( event, ui );
    }
  });
  $( "#sigma0_amount" ).val( sigma0_value + " GeV cm^-3" );

  
  Nstar_min = 0.01*Math.pow(10,10);
  Nstar_max = 4.0*Math.pow(10,11);
  Nstar_value = Nstar;
  Nstar_coeff = Nstar_min; 

  $( "#slider_Nstar" ).slider({
    // orientation: "vertical",
    range: "min",
    min: Nstar_min/Nstar_coeff,
    max: Nstar_max/Nstar_coeff,
    value: Nstar_value/Nstar_coeff,
    slide: function( event, ui ) {
      slide_Nstar_slider( event, ui );
    },
    change: function( event, ui ) {
      slide_Nstar_slider( event, ui );
    }
  });

  $( "#Nstar_amount" ).val( Nstar_value + " stars" );
  
}

function object_opacity(d) {
  var object = svg.selectAll("."+d);
  var curr_opacity = object.style("opacity");
  var new_opacity = 0;

  if(is(d, "err"))
    new_opacity = err_op - Math.round(curr_opacity*10)/10;
  else if(is(d, "sun"))
    new_opacity = sun_op - Math.round(curr_opacity*10)/10;
  else
    new_opacity = 1 - curr_opacity;
  
  object.style("opacity", new_opacity); 
}

function update_line(line_class, v_array) {
  var line_svg = svg.select(line_class)
  var line_data = get_line_data(line_class);

  Object.keys(line_data.values).map(function(value, index) {
    line_data.values[value].v = v_array[index];
    line_data.values[value].y0 = v_array[index];
  })

  line_svg
    .data([line_data])
    .attr("stroke-dashoffset", "0")         
    .attr("d", function(d) { return line(d.values); })
}

function get_line_data(line_class) {
  var line_svg = svg.select(line_class)
  var line_data = line_svg.data()[0];

  return line_data;
}

function update_velocities(data) {
 var velocities = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {R: d.R,
                  v: name.contains("vel") ? +d[name] * (0.75) : +d[name], 
                  y0: name.contains("ERR_MAX") ? 
                      +d[name.replace("_ERR_MAX", "")] : name.contains("ERR_MIN") ? 
                      +d[name.replace("_ERR_MIN", "")] : name.contains("vel") ? 
                      +d[name] * (0.75) : +d[name]};
          })
        };
    });

 return velocities;
}

function update_total_velocities(VROT_GR, VROT_DARK) {
  VROT_TOTAL = Array(VROT_GR.length);

  for(var i=0;i<VROT_GR.length;i++) {
    VROT_TOTAL[i] = Math.sqrt(VROT_GR[i]*VROT_GR[i] + VROT_DARK[i]*VROT_DARK[i]);
  }

  VROT_GR_GLOBAL = VROT_GR
  VROT_DARK_GLOBAL = VROT_DARK

  update_line(".VROT_TOTAL", VROT_TOTAL);
}

function update_original(type) {
  var orig_val = 0;
  var coeff = 0;
  var val_suffix = "";

  if(type == "Nstar"){
    coeff = Nstar_coeff;
    orig_val = Nstar_orig/coeff;
    val_suffix = " stars";
  }
  else if(type == "r0"){
    coeff = 1/r0_coeff;
    orig_val = r0_orig/coeff;
    val_suffix = " kpc";
  }
  else if(type == "sigma0"){
    coeff = sigma0_coeff;
    orig_val = sigma0_orig/coeff;
    val_suffix = "GeV cm^-3";
  }

  var slider_name = "#slider_" + type;

  // $("#"+ type + "_amount").val( orig_val*coeff + val_suffix );

  $slider = $(slider_name);
  $slider.slider("value", orig_val);
  $slider.trigger("change");

}

function slide_Nstar_slider( event, ui ) {
  if(typeof Nstar != undefined)
    _Nstar = Nstar;
  else
    _Nstar = Nstar_orig;

  var local_Nstar = Math.round(+ui.value)*Nstar_coeff;
  $( "#Nstar_amount" ).val( local_Nstar + " stars" );

  Nstar = local_Nstar;
  
  var VROT_GR_Nstar = v_gr_no_calc(Rkpc, get_line_data(".VROT_GR"), local_Nstar);
  

  /* 
  //Old code to manually calculate the new VROT General Relativity curve
  VROT_BULGE_N = v_bulge_n(Rkpc, bulge_b, bulge_t);

  for(var i=0;i<VROT_GR_GLOBAL.length;i++){
    VROT_GR_Nstar[i] = Math.sqrt(VROT_GR_Nstar[i]*VROT_GR_Nstar[i] + VROT_BULGE_N[i]);
  }

  while(!calc_done){
   // Lock for the calculations for finish 
     println("Calculating...")
  }
  */

  update_line(".VROT_GR", VROT_GR_Nstar);
  update_total_velocities(VROT_GR_Nstar, VROT_DARK_GLOBAL);
  calc_done = false;

  var VROT_CONFORMAL_DATA = get_line_data(".VROT_CONFORMAL");
  var VROT_CONFORMAL_Nstar = v_conformal(Rkpc, VROT_CONFORMAL_DATA, local_Nstar)

  update_line(".VROT_CONFORMAL", VROT_CONFORMAL_Nstar);
}

function slide_r0_slider( event, ui ) {
  var local_r0 = +ui.value/r0_coeff;
  $( "#r0_amount" ).val( local_r0 + " kpc");
  var VROT_DARK_r0 = v_dark(Rkpc, local_r0, sigma0);

  r0 = local_r0;

  update_line(".VROT_DARK", VROT_DARK_r0);
  update_total_velocities(VROT_GR_GLOBAL, VROT_DARK_r0);
}

function slide_sigma0_slider( event, ui ) {
  var local_sigma0 = Math.round(+ui.value)*sigma0_coeff;
  $( "#sigma0_amount" ).val( local_sigma0 + " GeV cm^-3" );
  var VROT_DARK_sigma0 = v_dark(Rkpc, r0, local_sigma0);

  sigma0 = local_sigma0;

  update_line(".VROT_DARK", VROT_DARK_sigma0);
  update_total_velocities(VROT_GR_GLOBAL, VROT_DARK_sigma0);
}

function children_length(velocity, i) {
  return velocity[0][i].children.item(0).getTotalLength();
}

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

function println(p) {
  console.log(p);
}

//---------- Equations ----------//
var B = 1.48 //km
var c = 300000 // km

//sigma0 defined above
//r0 defined above 
//Rkpc defined above 
//R0kpc defined above 
//Nstar defined above 

function v_gr(R_array, Nstar_slider, R0kpc){
  var R_size = R_array.length; 
  var v_rot = new Array(R_size)
  var R0km = kpc_to_km(R0kpc);

  for(var i=0;i<R_size;i++){
    var R = kpc_to_km(R_array[i]);
    var x = (R/(2*R0km));
    var bessel_func = (besseli(x,0)*besselk(x,0) - besseli(x,1)*besselk(x,1));

    v_rot[i] = Math.sqrt(R * ( ((Nstar_slider*B*c*c*R)/(2*R0km*R0km*R0km)) * bessel_func ) );

  }

  return v_rot;
}

function v_gr_no_calc(R_array, VROT_GR_DATA, Nstar_slider) {
  var R_size = R_array.length; 
  var v_rot = new Array(R_size)

  for(var i=0;i<R_size;i++){
    v_rot[i] = VROT_GR_DATA.values[i].v/Math.sqrt(_Nstar) * Math.sqrt(Nstar);
  }

  return v_rot;
}

function v_dark(R_array, r0_slider, sigma0_slider) {
  var R_size = R_array.length; 
  sigma0_slider = GeVcm3_to_kgkms2(sigma0_slider);
  var v_rot = new Array(R_size);
  var inner;

  for(var i=0;i<R_size;i++){
    inner = (4*Math.PI*B*c*c*sigma0_slider) * (1-((r0_slider/R_array[i])*Math.atan(R_array[i]/r0_slider)));
    v_rot[i] = Math.sqrt(Math.abs(inner));
  }

  return v_rot;
}

function v_conformal(R_array, VROT_CONFORMAL_DATA, Nstar_slider) {
  var R_size = R_array.length; 
  var v_rot = new Array(R_size)

  for(var i=0;i<R_size;i++){
    v_rot[i] = VROT_CONFORMAL_DATA.values[i].v/Math.sqrt(_Nstar) * Math.sqrt(Nstar);
  }

  return v_rot;
}

function kpc_to_km(kpc){
  var return_val = kpc * 3.08567758 * Math.pow(10,16)
  return return_val
}

function GeVcm3_to_kgkms2(GeV){
  // GeV/cm^3 to kg/km*s^2
  return GeV * 0.1602117 // kg/km*s^2
}

// Bulge

//Numerical integration function
function integral_func(z){
  return Math.pow(z,2)*besselk(z,0);
}

function v_bulge_n(x, bulge, t) {
  var R_size = x.length;
  var bulge_contrib = new Array(R_size);

  for(var i=0;i<R_size;i++){
    bulge_contrib[i] = bulge*27478.2/x[i]*numerically_integrate(0.00001, x[i]/t, 1, integral_func);
  }

  //Finished with heavy calulations
  calc_done = true;
  return bulge_contrib;
}

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