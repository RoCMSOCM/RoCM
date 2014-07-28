var chi_margin = {top: 20, right: 20, bottom: 50, left: 80},
    chi_width = 400 - chi_margin.left - chi_margin.right,
    chi_height = 200 - chi_margin.top - chi_margin.bottom;

var chi_x = d3.scale.linear()
    .range([0, chi_width]);

var chi_y = d3.scale.linear()
    .range([chi_height, 0]);

var chi_xAxis = d3.svg.axis()
    .scale(chi_x)
    .orient("bottom");

var chi_yAxis = d3.svg.axis()
    .scale(chi_y)
    .orient("left")
    .ticks(10, "%");

var chi_svg = d3.select("#chi_graph_svg")
    .attr("width", chi_width + chi_margin.left + chi_margin.right)
    .attr("height", chi_height + chi_margin.top + chi_margin.bottom)
  .append("g")
    .attr("transform", "translate(" + chi_margin.left + "," + chi_margin.top + ")");

function create_bar_chart(model_name){
	var data = get_bar_data(model_name);

	set_domain(data);

	var barWidth = chi_width / data.length;


	chi_svg.selectAll(".bar")
		.data(data)
	.enter().append("rect")
		.attr("class", "bar")
		.style("fill", "#f6931f")
		.attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; })
		.attr("width", barWidth)
		.attr("y", function(d) { return chi_y(d.frequency); })
		.attr("height", function(d) { return chi_height - chi_y(d.frequency); });

	update_bar(model_name);

	chi_svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + chi_height + ")")
	  .call(chi_xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", chi_width/2)
      .attr("y", chi_margin.bottom*.75)
      .style("font", font)
      .style("text-anchor", "middle")
      .text("Observed vs. Modeled Difference");

	chi_svg.append("g")
	  .attr("class", "y axis")
	  .call(chi_yAxis)
	.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("x", -chi_margin.top)
	  .attr("y", -chi_margin.left/1.25)
	  .attr("dy", ".71em")
      .style("font", font)
	  .style("text-anchor", "end")
	  .text("Frequency");

	
}

function update_bar(model_name){
	if(model_name === undefined){
		var bar1 = chi_svg.selectAll(".bar")[0][0];
		model_name = bar1.id.split("BAR_")[1];
	}


	var data = get_bar_data(model_name);

	set_domain(data);

	update_bar_axes();

	//TODO: Update the bars (difference) that are left over

	chi_svg.selectAll(".bar")
	  .data(data)
	  .attr("id", "BAR_" + model_name)
	  .attr("y", function(d) { return chi_y(d.frequency); })
	  .attr("height", function(d) { return chi_height - chi_y(d.frequency); });

	create_bar_title(model_name);
}

function update_bar_axes() {
	chi_svg.selectAll("g.y.axis")
        .call(chi_yAxis);

  	chi_svg.selectAll("g.x.axis")
        .call(chi_xAxis);
}

function set_domain(data){

	chi_x.domain(d3.extent(data, function(d) { return d.difference; }));
	chi_y.domain(d3.extent(data, function(d) { return d.frequency; }));



}

function get_bar_data(model_name){
	var data = [];

	var vel_data = VDATA.VROT_DATA;
	var vel_size = vel_data.length;

	var model_data = VDATA[model_name];

	for(var i=0;i<vel_size;i++){
		var diff = Math.round(difference(vel_data[i], model_data[i]));

		if(data[diff] === undefined){
			data.push({difference: diff, frequency: 1})
		}
		else{
			data[diff].frequency = data[diff].frequency+1;
		}
	}

	var data_size = data.length;


	data.forEach(function(d){
		d.frequency = d.frequency/data_size;
	});

	return data;
}

function create_bar_title(model_name){
	var title = chi_svg.select(".title");
	var model_string = legend_name(model_name);

	if(title[0][0] !== null && !title.html().contains(model_string)) {
		title.remove();
	}
	if(title[0][0] === null || !title.html().contains(model_string)){
		var title = chi_svg.append("text")
	      .attr("class", "title")
	      .attr("x", (chi_width / 2))             
	      .attr("y", -chi_margin.top/2)
	      .attr("text-anchor", "middle")  
	      .style("font", font)
	      .style("text-decoration", "underline")
	      .style("fill", "black")
	      .text(model_string + " Model");	
	  }

}

function type(d) {
  d.frequency = +d.frequency;
  return d;
}
;
