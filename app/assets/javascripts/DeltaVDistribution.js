var curve_deltaV = d3.svg.area()
  .interpolate("monotone")
  .x(function(d) { return isNaN(d.x) ? x(0) : x(d.x); })
  .y(function(d) { return isNaN(d.y) ? y(0) : y(d.y); })
  .y0(function(d) { return y(0); });

function plot_deltav_distribution(data){
  data = data.filter(function(d) {
    if(d.name.contains("DATA") || d.name.contains("DARK"))
      return false;
    else
      return true;
  });

  var all_deltav = {};
  var deltav_histograms = [];

  data.forEach(function(d) {
    var name = d.name;
    all_deltav[name] = [];
    d.values.forEach(function(dvalues) {
      all_deltav[name].push(dvalues.deltav);
    });
  
    var histogram = d3.layout.histogram()
      .bins(x.ticks(100))
      .frequency(false)
      (all_deltav[name]);

    deltav_histograms.push({name: name, histogram: histogram});
  })
  
  ymax = d3.max(deltav_histograms, function(d) { return d3.max(d.histogram, function(h) { return h.y; }); });
  y.domain([0,ymax]);

  var deltav_distribution_group = svg.append("g").attr("id", "deltav-distribution").selectAll(".deltav-distribution")
    .data(deltav_histograms)
    .enter().append("g")
      .attr("class", "deltav_distribution_group")

  var histo_curve = deltav_distribution_group.append("path")
    .attr("class", "DELTAVDISTRIBUTION")
    .attr("id", function(d) { return "DELTAVDISTRIBUTION-" + d.name; })
    .attr("d", function(d) { return curve_deltaV(d.histogram);})
    .style("fill", function(d) { return get_color(d.name); })
    .style("fill-opacity", 0)
    .style("stroke-opacity", 1)
    .style("stroke-width", "2px")
    .style("stroke", function(d) { return get_color(d.name); });
}

$(document).ready(function() { 
  // Actives the DeltaV Density functionality
  add_click_listener("deltav_distribution_button", "ΔV/V Distribution Plot", "DELTAV-DISTRIBUTION");
});