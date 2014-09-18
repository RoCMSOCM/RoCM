function deltav(V_model, V_Obs) {
	// dV/V
	// dV = (V_model - V_Obs) / V_Obs
	// .`.
	// ((V_model - V_Obs) / V_Obs ) / V_Obs
  var dV_V = ((V_model - V_Obs) / V_Obs ) / V_Obs;
  if(isNaN(dV_V))
    dV_V = 0;
  return dV_V;
}

function plot_deltav(data){
  data = data.filter(function(d) {
    if(d.name.contains("DATA") || d.name.contains("DARK"))
      return false;
    else
      return true;
  })

  var deltav_group = svg.append("g").attr("id", "deltav").selectAll(".deltav")
    .data(data)


  deltav_group
    .enter().append("g")
      .attr("class", "deltav_group")
      .each(function(D, i) {
        var name = D.name;

        var deltav_dot = d3.select(this)
          .selectAll("circle")
          .data(D.values);

        deltav_dot.enter().append("circle")  
          .attr("class", "DELTAV")
          .attr("r", 2)
          .attr("cx", function(d) { return x(d.R); })
          .attr("cy", function(d) { return y(d.deltav); })
          .attr("opacity", get_opacity("DATA"))
          .style("fill", function(d) { return get_color(name); });
      })
}