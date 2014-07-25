var bar_margin = {top: 20, right: 20, bottom: 50, left: 80},
    bar_width = 400 - bar_margin.left - bar_margin.right,
    bar_height = 200 - bar_margin.top - bar_margin.bottom;

var bar_x = d3.scale.linear()
    .range([0, bar_width]);

var bar_y = d3.scale.linear()
    .range([bar_height, 0]);

var bar_xAxis = d3.svg.axis()
    .scale(bar_x)
    .orient("bottom")
    .ticks(7);

var bar_yAxis = d3.svg.axis()
    .scale(bar_y)
    .orient("left")
    .ticks(6, "%");

var bar_svg;

var bar_key_fn = function(d) { return bar_x(d.chi_squared); }


function create_bar_chart(model_name){
	bar_svg = d3.select("#bar_graph_svg")
	    .attr("width", bar_width + bar_margin.left + bar_margin.right)
	    .attr("height", bar_height + bar_margin.top + bar_margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")");

	var $chi_button= $('<input/>').attr({ id: 'chi_button', type: 'button', name:'chi_buuton', value:'Hide Chi Squared'});

	$chi_button.button().click(function() {
		// Button name changes based on 'Show' and 'Hide'
		if(this.value.contains("Show")){
			this.value = this.value.replace("Show", "Hide");
			d3.select("#bar_graph_svg").style("display", "block");
		}
		else {
			this.value = this.value.replace("Hide", "Show");
			d3.select("#bar_graph_svg").style("display", "none");
		}

	});

	$("#sliders").prepend($chi_button);

	var data = get_bar_data(model_name);

	set_bar_domain(data);

	var barWidth = bar_width / data.length;


	var bar = bar_svg.selectAll(".bar")
		.data(data);

		
	bar.enter().append("rect")
		.attr("class", "bar")
		.style("fill", function(d) { return d.color; }) // "#f6931f"
		.attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; })
		.attr("width", barWidth)
		.attr("y", function(d) { return bar_y(d.frequency); })
		.attr("height", function(d) { return bar_height - bar_y(d.frequency); });

	bar.exit().remove();

	update_bar(model_name);

	bar_svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + bar_height + ")")
	  .call(bar_xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", bar_width/2)
      .attr("y", bar_margin.bottom*.75)
      .style("font", FONT)
      .style("text-anchor", "middle")
      .text("χ²");
      // .text("Observed vs. Modeled Difference");

	bar_svg.append("g")
	  .attr("class", "y axis")
	  .call(bar_yAxis)
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("x", -bar_margin.top)
	  .attr("y", -bar_margin.left/1.25)
	  .attr("dy", ".71em")
      .style("font", FONT)
	  .style("text-anchor", "end")
	  .text("Frequency");

	 apply_axis_formatting(bar_svg);

	
}

function update_bar(model_name){
	if(model_name === undefined){
		var bar1 = bar_svg.selectAll(".bar")[0][0];
		model_name = bar1.id.split("BAR_")[1];
	}


	var data = get_bar_data(model_name);

	set_bar_domain(data);

	update_bar_axes();

	//TODO: Update the bars (difference) that are left over

	var bars = bar_svg.selectAll(".bar")
	  .data(data);

	bars.attr("id", "BAR_" + model_name)
	  .style("fill", function(d) { return d.color; })
	  .attr("y", function(d) { return bar_y(d.frequency); })
	  .attr("height", function(d) { return bar_height - bar_y(d.frequency); });


	create_bar_title(model_name);

	update_chi_squared(model_name);
}

function update_chi_squared() {
	for(var model in GMODEL) {
		if(model != "DARK")
			update_chi_squared_model(model);
	}
}

function update_chi_squared_model(model_name) {
	var data = get_bar_data(model_name);

	var chisqr = 0;
	data.forEach(function(d) {
		chisqr += d.chi_squared;
	});

	var chi_model = model_name + " χ²";
	PARAMS[chi_model] = chisqr;
	update_param_table(chi_model);
}

function update_bar_axes() {
	bar_svg.selectAll("g.y.axis")
        .call(bar_yAxis);

  	bar_svg.selectAll("g.x.axis")
        .call(bar_xAxis);

	apply_axis_formatting(bar_svg);
}

function set_bar_domain(data){
	var xrange = d3.extent(data, function(d) { return d.chi_squared; });
	var yrange = d3.extent(data, function(d) { return d.frequency; });

	bar_x.domain(xrange);
	bar_y.domain(yrange);
}

function get_bar_data(model_name){
	var data = [];

	var vel_data = VDATA.VROT_DATA;
	var vel_size = vel_data.length;

	var model_data = VDATA["VROT_" + model_name];
	var total = 0;

	for(var i=0;i<vel_size;i++){
		var X2 = chi_squared(vel_data[i], model_data[i]);

		if(data[X2] === undefined){
			data.push({chi_squared: X2, frequency: 1, color: get_color(model_name)})
		}
		else{
			data[X2].frequency = data[X2].frequency+1;
		}
		total += 1;
	}

	var data_size = data.length;


	data.forEach(function(d){
		d.frequency = d.frequency/total;
	});

	return data;
}

function create_bar_title(model_name){
	var title = bar_svg.select(".title");
	var model_string = legend_name(model_name);

	if(title[0][0] !== null && !title.html().contains(model_string)) {
		title.remove();
	}
	if(title[0][0] === null || !title.html().contains(model_string)){
		var title = bar_svg.append("text")
	      .attr("class", "title")
	      .attr("x", (bar_width / 2))             
	      .attr("y", -bar_margin.top/2)
	      .attr("text-anchor", "middle")  
	      .style("font", FONT)
	      .style("text-decoration", "underline")
	      .style("fill", "black")
	      .text(model_string + " Model");	
	  }

}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}