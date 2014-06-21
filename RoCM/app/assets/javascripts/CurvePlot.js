// Our Sun's distance to the galactic center
var d_sun = 8.33 //+- 0.35 kpc

var margin = {top: 20, right: 125, bottom: 30, left: 40},
width = 1050 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

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

var curve = d3.svg.area()
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

var wrapper = d3.select("#rocm_wrapper")
  .attr("width", "75%")
  .attr("min-width", width + margin.left + margin.right + 200);

var animate_beginning = false;

var time = animate_beginning ? 7500 : 0;

var err_op = 1.0; // Error opacity

var sun_op = 1.0;

var sun_class = "SUN"

var sun_label = "Sun"

var galaxy_name = "Milky Way";

var hide_legend_labels = true;

var ORIGIN = 0.0000000001

function get_data(data) {
  var data_keys = Object.keys(data[0]);
  var origin_data = {};

  // Add origin to the data
  for(var k=0;k<data_keys.length;k++){
    origin_data[data_keys[k]] = ORIGIN;
  }
  data.unshift(origin_data);


  color.domain(d3.keys(data[0]).filter(function(key) { 
    return key !== "R" && !key.contains("R_ERR"); 
  }));


  var data_size = data.length;

  //Defines global array of Galactocentric distance, R (kpc)
  VDATA.Rkpc = Array(data_size);

  for(var i=0;i<data_size;i++){
    VDATA.Rkpc[i] = +data[i].R;
  }

  data.forEach(function(d) {
    d.R = +d.R;
  });

  return data;

}

function dynam_set_range(data, velocities) {
  x.domain(d3.extent(data, function(d) { return d.R; }));
  
  var ymin = d3.min(velocities, function(c) { return d3.min(c.values, function(v) { return v.v; }); });

  var ymax = d3.max(velocities, function(c) { return d3.max(c.values, function(v) { return v.v; }); });

  y.domain([ymin, ymax + ymax/4]);
}

function create_axis() {

  create_xaxis()

  create_yaxis();


  svg.selectAll(".domain")
    .style("fill", "none")
    .style("stroke", "black")
    .style("shape-rendering", "middle");

  svg.selectAll(".tick")
    .style("font", font)
    .style("font-weight", "bold")
    .selectAll("line")
    .style("font-weight", "bold")
    .style("stroke", "#000");
}

function create_xaxis() {
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .style("fill", "black")
    .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 150)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("font", font)
      .style("fill", "black")
      .text("Galactocentric Distance (kpc)")
      .transition()
        .duration(time*(3/4))    
        .attr("x", width);

}

function create_yaxis() {
  svg.append("g")
    .attr("class", "y axis")
    .style("fill", "black")
    .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -height + 150)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font", font)
      .style("fill", "black")
      .text("Rotational Velocity (km/s)")
      .transition()
        .duration(time*(3/4))    
        .attr("x", 0);
}

function create_sun_label() {
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
}

function create_error_bar(data) {
  x_err = 0.2
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

function plot_data(data){
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
}

function plot_curves(velocities){
  velocity = svg.selectAll(".velocity")
    .data(velocities)
    .enter().append("g")
      .attr("class", "velocity");


  velocity.append("path")
    .attr("class", function(d) { return d.name; })
    .attr("d", function(d) { return d.name.contains("DATA") ? null : curve(d.values); })
    .attr("stroke-dasharray", function(d,i) { return is(d, "data") ? "0 0" : children_length(velocity, i) + " " + children_length(velocity, i)*2; } )
    .attr("stroke-dashoffset", function(d,i) {return is(d, "data") ? "0 0" :  children_length(velocity, i); } )
    .style("stroke", function(d) { return get_colors(d); })
    .style("stroke-width", 1.5)
    .style("fill", "none")
    .style("opacity", function(d) { return get_opacity(d); })
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
}

function create_legend(velocities) {
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
      update_bar(d.name, get_bar_data(d.name));
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
    .style("fill", "black")
    .text(function(d) { return legend_name(d.name); })
    .on("click", function(d) {
      var object_class = is(d, "err") ? "VROT_DATA_ERR" : d.name;
      object_opacity(object_class);
    });
}

function create_title(SHOW_TITLE, ANIMATE_TITLE) {
  if(SHOW_TITLE){
    var title = svg.append("text")
      .attr("class", "title")
      .attr("x", (width / 2))             
      .attr("y", ANIMATE_TITLE ? 220 : 0)
      .attr("text-anchor", "middle")  
      .style("font", font)
      .style("font-size", ANIMATE_TITLE ? "40px" : "14px") 
      .style("text-decoration", "underline")
      .style("fill", "black")
      .text(galaxy_name + " Galaxy");

    if(ANIMATE_TITLE){
      title.transition()
        .duration(time*(3/4)) 
        .style("font-size", "14px") 
        .attr("y", 0);
    }
  }
}

function create_curve_plot(){
  d3.csv("../data/velocity/MILKY_WAY_OUTPUT.csv", function(error, data) {

    // META
    data = get_data(data);


    // for(var g=ORIGIN;g<100;g++)
    //   println(GMODEL["VROT_DARK"](g))

    
    var velocities = update_velocities(data);

    var vel_size = Object.keys(velocities).length;
    var data_size = velocities[0].values.length;
    
    // TODO: VDATA for ParamsDict
    VDATA.VROT_GR = Array(data_size);
    VDATA.VROT_DARK = Array(data_size);
    VDATA.VROT_DATA = Array(data_size);

    for(var i=0;i<vel_size;i++){
      VDATA[velocities[i].name] = Array(data_size);

      for(var j=0;j<data_size;j++){
        VDATA[velocities[i].name][j] = velocities[i].values[j].v
      }
      
    }

    
    dynam_set_range(data, velocities);

    create_axis();

    var SHOW_ERR_BAR = true;

    var SHOW_SUN_LINE = true;

    if(SHOW_SUN_LINE){
      create_sun_label();
    }
    

    if(SHOW_ERR_BAR){
      create_error_bar(data);
    }


    plot_data(data);

    plot_curves(velocities);

    create_legend(velocities);

    create_title(SHOW_TITLE = true, ANIMATE_TITLE = false);

    // TODO: move bar chart
    create_bar_chart("VROT_GR");
  });
}

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
  o_total = 0
  o_sun = sun_op
  o_gr = 1
  o_bulge = 0
  o_default = 1
  o_conformal = 0

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
  var line_svg = svg.select(line_class);
  var line_data = get_line_data(line_class);

  Object.keys(line_data.values).map(function(value, index) {
    line_data.values[value].v = v_array[index];
    line_data.values[value].y0 = v_array[index];
  });

  line_svg
    .data([line_data])
    .attr("stroke-dashoffset", "0")         
    .attr("d", function(d) { return curve(d.values); });
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

function children_length(velocity, i) {
  return velocity[0][i].children.item(0).getTotalLength();
}