// Our Sun's distance to the galactic center
var d_sun = 8.1 //+- 0.6 kpc

var margin = {top: 20, right: 220, bottom: 30, left: 80},
width = 1150 - margin.left - margin.right,
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

var yAxisRight = d3.svg.axis()
  .scale(y)
  .orient("right");

var curve = d3.svg.area()
  .interpolate("monotone")
  .tension([0.1])
  .x(function(d) { return x(d.R); })
  .y(function(d) { return isNaN(d.v) ? y(0) : y(d.v); })
  .y0(function(d) { return isNaN(d.y0) ? y(0) : y(d.y0); });

var xy_line = d3.svg.line()
  .x(function(d) { return x(d.x); })
  .y(function(d) { return y(d.y); });

// var zoom = d3.behavior.zoom()
//   .x(x)
//   .y(y)
//   .scaleExtent([0, 10])
//   .on("zoom", zoomed);

var svg;

var ANIMATE_BEGINNING = false;

var TIME = ANIMATE_BEGINNING ? 7500 : 0;

var DASHED_CURVES = false;

var err_op = 1.0; // Error opacity

var sun_op = 1.0;

var sun_color = "cadetblue";

var sun_class = "SUN"

var sun_label = "Sun"

var hide_legend_labels = true;

var ORIGIN = 0; //0.0000000001

function get_data(data) {
  var data_keys = Object.keys(data[0]);
  var origin_data = {};

  // Add origin to the data
  for(var k=0;k<data_keys.length;k++){
    origin_data[data_keys[k]] = ORIGIN;
  }
  data.unshift(origin_data);

  var data_size = data.length;

  data.forEach(function(d) {
    d.R = +d.r;
    d.VROT_DATA = +d.vrot_data;
    d.VROT_DATA_ERROR = +d.vrot_data_error;
    delete d.galaxy_id;
    delete d.id;
    delete d.r;
    delete d.vrot_data;
    delete d.vrot_data_error;
  });

  data = sortByKey(data, "R");

  //Defines global array of Galactocentric distance, R (kpc)
  VDATA.R = Array(data_size); // Mutable R values
  VDATA._R = Array(data_size); // Original R values

  for(var i=0;i<data_size;i++){
    VDATA.R[i] = +data[i].R;
    VDATA._R[i] = +data[i].R;
  }

  return data;
}

function add_models_to_data(data) {
    data.forEach(function(d) {
      for(var model in GMODEL) {
        d["VROT_" + model] = GMODEL[model](+d.R);
      }
    });
    return data;
}

function create_curve_plot_svg() {
  // D3 graph set-up
  var graph_id = "graph_svg";

  svg = d3.select("#" + graph_id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // .call(zoom);

  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("transform", "translate(" + -margin.left + "," + -margin.top + ")")
    .attr("fill", "white");


  d3.select("#rocm_wrapper")
    .attr("width", "75%")
    .attr("min-width", width + margin.left + margin.right + 200);

  var graph = $("#" + graph_id)
  graph.draggable()
    .attr("class", "draggable")
    .data({
      'originalLeft': graph.css('left'),
      'origionalTop': graph.css('top')
    });
}

function create_curve_plot(galaxy_name, is_initial){
  // Generate the D3 plot with the velocity data (red data points)
  // and compute each model from GMODEL (colored curved lines)
  if(!SOCMPARAMS[galaxy_name]){
    alert("No velocity data for " + galaxy_name + ".");
    return -1;
  }

  // Call SOCM for galaxy parameters
  import_parameters(SOCMPARAMS[galaxy_name], is_initial);

  var galaxy_id = SOCMPARAMS[galaxy_name].id;
  d3.json(socm_url + "/" + galaxy_id + "/velocities.json?page=false", function(error, data) {

    // META
    data = get_data(data);

    data = add_models_to_data(data);

    var velocities = update_velocities(data);

    var vel_size = Object.keys(velocities).length;
    var data_size = velocities[0].values.length;
      
    for(var i=0;i<vel_size;i++){
      var name = velocities[i].name;
      VDATA[name] = Array(data_size);
      VDATA["_" + name] = Array(data_size);

      for(var j=0;j<data_size;j++){
        VDATA[name][j] = velocities[i].values[j].v;
        VDATA["_" + name][j] = velocities[i].values[j].v;
      }
    }
    
    set_curve_domain(data, velocities);

    // zoom.x(x).y(y);

    if(is_initial)
      create_axes();
    else {
      update_axes();
    }

    var SHOW_ERR_BAR = true;

    var SHOW_SUN = false; //(galaxy_name == "Milky-Way");

    if(SHOW_SUN){
      create_sun_label();
    }
    
    if(!is_initial){
      remove_data();
      remove_curves();
      remove_title();
    }
    else {
      create_legend(velocities, SHOW_SUN);
    }


    if(SHOW_ERR_BAR){
      create_error_bar(data);
    }

    // svg.attr("display", "block");

    plot_data(data);
    plot_curves(velocities);

    // Create title for the galaxy
    create_title(galaxy_name, SHOW_TITLE = true, ANIMATE_TITLE = false);
    
    // if(is_initial){
    //   // TODO: move bar chart
    //   create_bar_chart("VROT_GR");
    // } 

    if(is_initial)
      create_chi_table();
    else
      update_chi_squared();

    // Update distance value to alter x-axis (special case)
    update_derived_parameters("distance");
  });
}

function set_curve_domain(data, velocities) {
  x.domain(d3.extent(data, function(d) { return d.R; }));

  var ymin = d3.min(velocities, function(c) { return d3.min(c.values, function(v) { return v.v; }); });
  var ymax = d3.max(data, function(d) { return d.VROT_DATA; });

  y.domain([ymin, ymax + ymax/4]);
}

function set_curve_y_domain(min, max) {
  var data_max = d3.max(VDATA.VROT_DATA);
  var data_max_alt = data_max + data_max/4;

  max = max > data_max_alt ? max : data_max_alt;

  y.domain([min, max]);

  return max != data_max_alt;
}

function set_curve_x_domain(min, max) {
  x.domain([min, max]);
}

function create_axes() {

  create_xaxis()

  create_yaxis();

  apply_axis_formatting(svg);

}

function get_max_y() {
  return y.domain()[1];
}

function get_max_x() {
  return x.domain()[1];
}

function update_axes() {
  svg.selectAll(".x.axis").call(xAxis);

  svg.selectAll(".y.axis").call(yAxis);
  svg.selectAll(".y.axis.right").call(yAxisRight)
    .selectAll("text").remove();

  apply_axis_formatting(svg);
}

function update_x_axis(min, max) {
  set_curve_x_domain(min, max);
  update_axes();
}

function update_y_axis(min, max) {
  var set = set_curve_y_domain(min, max);
  update_axes();
  return set;
}

function apply_axis_formatting(svg) {
  svg.selectAll(".domain")
    .style("fill", "none")
    .style("stroke", "black")
    .style("shape-rendering", "middle");

  svg.selectAll(".tick")
    .style("font", FONT)
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
      .style("font", FONT)
      .style("fill", "black")
      .text("Galactocentric Distance, R (kpc)")
      .transition()
        .duration(TIME*(3/4))    
        .attr("x", width);

}

function create_yaxis() {

  var right_legend = svg.append("g")             
    .attr("class", "y axis right")    
    .attr("transform", "translate(" + width + " ,0)")   
    .style("fill", "black")       
    .call(yAxisRight)
    .selectAll("text").remove();


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
      .style("font", FONT)
      .style("fill", "black")
      .text("Rotation Velocity, VROT (km/s)")
      .transition()
        .duration(TIME*(3/4))    
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
    .style("stroke", sun_color)
    .style("fill", "none")
    .style("opacity", get_opacity("sun"));
  
  var sun_text = svg.append("text")
    .attr("class", sun_class)
    .attr("x", x(d_sun_line[1].x))             
    .attr("y", y(d_sun_line[1].y))
    .attr("text-anchor", "middle")  
    .style("font", FONT)
    .style("font-size", "0px") 
    .style("stroke", sun_color)
    .style("opacity", get_opacity("sun"))
    .text(sun_label);

  sun_text.transition()
    .duration(TIME*(3/4)) 
    .style("font-size", "12px");
}

function create_error_bar(data) {
  var err_svg = svg.append("g").attr("id", "stars_error");

  for(var i=0;i<data.length;i++){
    var err_y = [
      {x:data[i].R, y:data[i].VROT_DATA + data[i].VROT_DATA_ERROR},
      {x:data[i].R, y:data[i].VROT_DATA - data[i].VROT_DATA_ERROR}
    ];
    err_svg.append("path")
      .datum(err_y)
      .attr("class", "VROT_DATA_ERROR")
      .attr("d", xy_line)
      .style("fill", "none")
      .style("stroke", get_color("DATA_ERROR"))
      .style("stroke-width", "1.5px")
      .style("opacity", err_op);   
    }
}

function plot_data(data){
  svg.append("g").attr("id", "stars").selectAll(".dot")
    .data(data)
    .enter().append("circle")
      .attr("class", "VROT_DATA")
      .attr("r", 2)
      .attr("cx", function(d) { return x(d.R); })
      .attr("cy", function(d) { return y(d.VROT_DATA); })
      .style("fill", get_color("DATA"));


    $(".VROT_DATA").tipsy({ 
      gravity: 's', 
      html: true, 
      title: function() {
        var tooltip = "";
        var d = this.__data__;
        for(var v in VDATA) {
          if(v[0] != "_" && v != "R"){
            tooltip += v.replace("VROT_", "") + " <br> (" + formatExponential(d.R) + " kpc, " + formatExponential(VDATA[v][VDATA.R.indexOf(d.R)]) + " km/s) <br>";
          }
        }

        return tooltip;
        }
      })


}

function update_data(R_data, V_data) {

  var dot_data = get_dot_data(".VROT_DATA");

  var size = R_data.length;
  for(var i=0; i<size; i++) {
    dot_data[i].R = R_data[i];
    dot_data[i].VROT_DATA = V_data[i];
  }

  svg.selectAll(".VROT_DATA")
    .data(dot_data)
    .attr("cx", function(d) { return x(d.R); })
    .attr("cy", function(d) { return y(d.VROT_DATA); })
    .select(".VROT_DATA_TITLE")
      .text(function(d) { return "(" + d.R + ", " + d.VROT_DATA + ")"; });
}

function update_error_bar(R_data) {
  var error_bars = d3.selectAll(".VROT_DATA_ERROR");
  var error_data = [];

  for(var i=0;i<R_data.length;i++){
    error_data.push([
      {x:R_data[i], y:VDATA.VROT_DATA[i] + VDATA.VROT_DATA_ERROR[i]},
      {x:R_data[i], y:VDATA.VROT_DATA[i] - VDATA.VROT_DATA_ERROR[i]}
    ]);
  }

  error_bars
    .data(error_data)
    .attr("d", xy_line);
}

function remove_data() {
  svg.selectAll(".VROT_DATA").remove();
  svg.selectAll(".VROT_DATA_ERROR").remove();
}

function plot_curves(velocities){
  var velocity = svg.append("g").attr("id", "velocities").selectAll(".velocity")
    .data(velocities)
    .enter().append("g")
      .attr("class", "velocity");

  var path = velocity.append("path");

  create_curve(path);
}

function create_curve(path_svg) {
  path_svg.attr("class", function(d) { return d.name; })
    .attr("d", function(d) { return d.name.contains("DATA") ? null : curve(d.values); })
    .attr("stroke-dasharray", function(d,i) { return is(d, "data") || !ANIMATE_BEGINNING ? "0 0" : children_length(velocity, i) + " " + children_length(velocity, i)*2; } )
    .attr("stroke-dashoffset", function(d,i) {return is(d, "data") || !ANIMATE_BEGINNING ? "0 0" :  children_length(velocity, i); } )
    .style("stroke", function(d) { return get_color(d); })
    .style("stroke-width", 1.5)
    .style("fill", "none")
    .style("opacity", function(d) { return get_opacity(d); })
    .transition()
      .duration(TIME)
      .ease("monotone")
      .style("fill", function(d, i) { return is(d, "err") ? "red" : "none"; })
      .attr("stroke-dasharray", function(d,i) { return is(d, "data") || !ANIMATE_BEGINNING ? "0 0" :  children_length(velocity, i) + " " + children_length(velocity, i)*2; } )
      .attr("stroke-dashoffset", function(d,i) { return 0; })
}

function remove_curves(){
  svg.selectAll(".velocity").remove();
}

function update_curve(line_class, v_array, R_array) {
  var line_svg = svg.select(line_class);
  var line_data = get_line_data(line_class);

  // If there is no curve, create one.
  if(line_data === undefined){
    line_data = {};
    line_data.name = line_class.replace(".","");
    line_data.values = Array(R_array.length);

    for(var i=0;i<line_data.values.length;i++){
      line_data.values[i] = {
        R:i, 
        v: v_array[i], 
        y0: v_array[i]
      }; 
    }

    var velocity = svg.select("#velocities")
                    .append("g").attr("class", "velocity");

    line_svg = velocity.append("path").data([line_data]);

    create_curve(line_svg);


  }

  // Add it to the legend if it doesn't exist
  var legend_id = "legend_" + line_data.name;
  if($("#" + legend_id).length == 0){
    var legend_panel = d3.select("#legend_panel");
    var all_legend_elements = legend_panel.selectAll(".legend");
    var legend_size = all_legend_elements[0].length;

    var legend = legend_panel
      .data([line_data])
      .append("g")
        .attr("class", "legend")
        .attr("id", legend_id)
        .attr("transform", function(d, i) { return "translate(0," + legend_size * legend_item_vertical_offset + ")"; });

    add_to_legend(legend);

  }

  Object.keys(line_data.values).map(function(value, index) {
    line_data.values[value].R = R_array[index];
    line_data.values[value].v = v_array[index];
    line_data.values[value].y0 = v_array[index];
  });

  line_svg
    .data([line_data])
    .attr("stroke-dashoffset", "0")         
    .attr("d", function(d) { return curve(d.values); });
}

// function create_curve() {

// }

function get_line_data(line_class) {
  var line_svg = svg.select(line_class)
  var line_data = line_svg.data()[0];

  return line_data;
}

function get_dot_data(dot_class) {
  var dot_svg = svg.selectAll(dot_class)
  var dot_data = dot_svg.data();

  return dot_data;
}

function update_velocities(data) {
  var keys = Object.keys(data[0]);
  var R_filtered = keys.filter(function(d) { return d != "R"; })

  var velocities = R_filtered.map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
      return {R: d.R,
        v: +d[name], 
        y0: name.contains("ERROR") ? +d[name.replace("_ERROR", "")] : +d[name]};
      })
    };
  });

 return velocities;
}

function children_length(velocity, i) {
  return velocity[0][i].children.item(0).getTotalLength();
}

// Legend placement constants
var leg_width = 18;
var leg_offset = 10;
var legend_item_vertical_offset = 25;
var legend_width_factor = 2;
var rect_position_offset = 5;

function create_legend(velocities, SHOW_SUN) {
  var legend_dialog = $("#rocm_wrapper").append($("<div>")
    .attr("id", "legend_confirm")
    .attr("title", "Remove model from legend?"));

  var legend_data = velocities;
  
  //Add sun to the legend data
  if(SHOW_SUN)
    legend_data.push({name:sun_class})

  var data_size = legend_data.length+2;
  
  var legend_panel_id = "legend_panel";

  var legend_panel = svg.append("svg")
    .attr("id", legend_panel_id)
    .attr("x", width + leg_width/2)
    .attr("y", -leg_width/2)
    .attr("height", "100%");

  legend_panel.append("rect")
    .attr("id", "legend_rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
    .attr("opacity", 0);


  var num_elements = 0;

  var legend = legend_panel.selectAll(".legend")
    .data(legend_data)
    .enter().append("g")
      .attr("class", "legend")
      .attr("id", function(d) { return "legend_" + d.name; })
      .attr("transform", function(d, i) { num_elements=i; return "translate(0," + i * legend_item_vertical_offset + ")"; });
  

  add_to_legend(legend);


  var max_width = 0;
    $('.legend').each(function(i,n){
      var width = n.getBoundingClientRect().width;

      if(width>max_width) max_width = width;
    });

    legend_panel.attr("width", max_width + leg_width);

    var using_chrome = (window.navigator.userAgent.indexOf("Chrome")  > -1);

    var off_x = (margin.left);
    var off_y = (margin.top);

    var legend_panel_svg = $("#legend_panel");
    legend_panel_svg
      .draggable()
      .attr("class", "draggable_child")
      .data({
        'originalX': legend_panel_svg.attr('x'),
        'origionalY': legend_panel_svg.attr('y')
      })      
      .bind('drag', function(event, ui){
        // update coordinates manually, since top/left style props don't work on SVG
        event.target.setAttribute('x', ui.position.left - off_x);
        event.target.setAttribute('y', ui.position.top - off_y);
        dragged = true;
      });
}

var dragged = false;

function add_to_legend(legend) {
  legend.append("rect")
    .attr("class", function(d) { return d.name + "_legend_rect"; })
    .attr("x", rect_position_offset)
    .attr("y", rect_position_offset)
    .attr("width", leg_width*legend_width_factor)
    .attr("height", leg_width)
    .style("opacity", 1.0)
    .style("fill", function(d) { return get_color(d); })
    .style("stroke", function(d) { return d3.rgb(get_color(d)).darker(2); })
    .on("mouseup", function(d) { 
      if(dragged){
        dragged = false;
        return;
      }
      var object_class = is(d, "err") ? "VROT_DATA_ERROR" : d.name;

      object_opacity(object_class);

      // if(!is(d, "data") && !is(d, "sun"))
        // update_bar(d.name, calculate_chi_squared_for_model(d.name));
    })
    .on("contextmenu", function(d, index) {
      // Handle right click, open dialog confirmation
      var dialog = $("#legend_confirm");
      var full_name = STYLE.get(d.name.replace("VROT_", "")).full_name;

      dialog.append($("<span>")
        .html("Do you want to remove " + full_name + " from the legend?")
        .append($("<br><br><span>")
          .html("This can be undone by reloading the page.")));

      dialog.dialog({
        resizable: false,
        height: 250,
        width: 400,
        modal: true,
        buttons: {
          Remove: function() {
            remove_legend_element(d, this);
          },
          Cancel: function() {
            $(this).dialog( "close" );
            $(this).empty();
          }
        }
      });      

      $("button").addClass("default_button");

      //stop showing browser menu
      d3.event.preventDefault();
    });


  legend.append("text")
    .attr("x", rect_position_offset + leg_width*legend_width_factor*1.1)
    .attr("y", rect_position_offset + leg_width/2)
    .attr("dy", ".35em")
    .attr("class", function(d) { return d.name + "_legend_text"; })
    .style("font", FONT)
    .style("font-style", "italic")
    .style("user-select", "none")
    .style("-moz-user-select", "none") 
    .style("-webkit-user-select", "none") 
    .style("-ms-user-select", "none")
    .style("fill", "black")
    .text(function(d) { return legend_name(d.name); })
    .on("mouseup", function(d) {
      if(dragged){
        dragged = false;
        return;
      }

      var object_class = is(d, "err") ? "VROT_DATA_ERROR" : d.name;
      object_opacity(object_class);
    });
}

function remove_legend_element(d, this_dialog) {
  var object_class = is(d, "err") ? "VROT_DATA_ERROR" : d.name;
  var object = svg.selectAll("."+object_class);
  object.style("opacity", 0);

  var this_name = d.name;
  var this_index = 0;
  var legend_data = d3.selectAll(".legend").data();

  for(var i=0;i<legend_data.length;i++) {
    if(legend_data[i].name == this_name)
      this_index = i;
  }
  var this_rect_class = "." + this_name + "_legend_rect";
  var this_text_class = "." + this_name + "_legend_text";

  svg.select(this_rect_class).node().parentNode.remove();
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

  legend_data = legend_data.filter(function(d,i) { 
    return i != this_index;
  });

  $(this_dialog).dialog( "close" );
  $(this_dialog).empty();
}

function create_title(galaxy_name, SHOW_TITLE, ANIMATE_TITLE) {
  if(SHOW_TITLE){
  var title = svg.append("text")
      .attr("class", "title")
      .attr("x", (width / 2))             
      .attr("y", ANIMATE_TITLE ? 220 : 0)
      .attr("text-anchor", "middle")  
      .style("font", FONT)
      .style("font-size", ANIMATE_TITLE ? "40px" : "14px") 
      .style("text-decoration", "underline")
      .style("fill", "black")
      .text(galaxy_name + " GALAXY");

    if(ANIMATE_TITLE){
      title.transition()
        .duration(TIME*(3/4)) 
        .style("font-size", "14px") 
        .attr("y", 0);
    }
  }
}

function remove_title() {
  svg.selectAll(".title").remove();
}

function get_color(d) {
  if(d.name !== undefined){
    d = d.name;
  }

  d = d.replace("VROT_", "");

  return STYLE.get(d).color;
}

function get_opacity(d) {
  if(d.name !== undefined){
    d = d.name;
  }

  d = d.replace("VROT_", "");
  
  return STYLE.get(d).opacity;
}

function set_opacity(model_name, opacity) {
  if(model_name.name !== undefined){
    model_name = model_name.name;
  }

  model_name = model_name.replace("VROT_", "");

  var model = STYLE.get(model_name);
  model.opacity = opacity;

  STYLE.set(model.model, model);
  localStorage.setItem("STYLE_dictionary", JSON.stringify(STYLE.getDict()));
}

function legend_name(d) {
  if(d.name !== undefined){
    d = d.name;
  }

  d = d.replace("VROT_", "");

  return STYLE.get(d).full_name;
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
  
  set_opacity(d, new_opacity);
  object.style("opacity", new_opacity); 
}

function zoomed() {
  if(x.domain()[0] < 0){
    var xdom1 = x.domain()[1];
    if(xdom1 < 0)
      return;
    x.domain([0, xdom1]);
  }
  svg.selectAll(".x.axis").call(xAxis);

  if(y.domain()[0] < 0){
    var ydom1 = y.domain()[1];
    if(ydom1 < 0)
      return;
    y.domain([0, ydom1]);
  }
  svg.selectAll(".y.axis").call(yAxis);
  svg.selectAll(".y.axis.right").call(yAxisRight)
    .selectAll("text").remove();

  apply_axis_formatting(svg);
}