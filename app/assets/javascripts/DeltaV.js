function deltav(V_model, V_Obs) {
	// dV/V
	// dV = (V_model - V_Obs) / V_Obs
	// .`.
	// ((V_model - V_Obs) / V_Obs ) / V_Obs
  var dV_V = ((V_model - V_Obs) / V_Obs );
  if(isNaN(dV_V))
    dV_V = 0;
  return Math.abs(dV_V)*100;
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

  var max_y = 80;

  deltav_group
    .enter().append("g")
      .attr("class", "deltav_group")
      .each(function(D, i) {
        var name = D.name;

        D.values = D.values.filter(function(dd) {
          return dd.deltav < max_y;
        })

        var deltav_dot = d3.select(this)
          .selectAll("circle")
          .data(D.values);

        if(name == "VROT_GR"){
          var sq = 5;
          deltav_dot.enter().append("rect")  
            .attr("class", "DELTAV")
            .attr("width", sq)
            .attr("height", sq)
            .attr("x", function(d) { return x(d.R) - (sq/2); })
            .attr("y", function(d) { return y(d.deltav) - (sq/2); })
            .attr("opacity", get_opacity("DATA"))
            .style("fill", function(d) { return get_color(name); });
        }
        else if(name == "VROT_CONFORMAL") {
          deltav_dot.enter().append("circle")  
            .attr("class", "DELTAV")
            .attr("r", 3)
            .attr("cx", function(d) { return x(d.R); })
            .attr("cy", function(d) { return y(d.deltav); })
            .attr("opacity", get_opacity("DATA"))
            .style("fill", function(d) { return get_color(name); });
        }
        else if(name == "VROT_TOTAL") {
          deltav_dot.enter().append("text")  
            .attr("class", "DELTAV")
            .attr("x", function(d) { return x(d.R); })
            .attr("y", function(d) { return y(d.deltav); })
            .attr("opacity", get_opacity("DATA"))
            .style("fill", function(d) { return get_color(name); })
            .text("Δ")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .style("font-size", "10px")
        }
      })
}

function add_click_listener_deltav() {
  // TODO: Dynamically create the menu items
  var span = $("<span>")
    .attr("class", "glyphicon glyphicon-th-large")

  var dv_button = $("#deltav_button");
  dv_button.text(" ΔV/V Plot");

  var dv = "#DELTAV";
  if(window.location.href.contains(dv))
    dv_button.text(" Rotation Curve Plot");

  dv_button.prepend(span);
  
  dv_button.click(function(){
    plot_deltav_reload();
  });
}

function plot_deltav_reload(galaxy_name) {
  var dv = "#DELTAV";
  var flag = false;

  if(galaxy_name !== undefined) {
    var new_galaxy_url = window.location.href.split("=")[0] + "=" + galaxy_name;
    if(window.location.href.contains(dv) && window.location.href.contains(galaxy_name))
      flag = true;
    else
      window.location.href = new_galaxy_url + dv;
  }
  else {
    if( !window.location.href.contains(dv) ) {
      window.location.href += dv;
    }
    else {
      window.location.href = window.location.href.replace(dv, "");
    }
  }


  if( !flag )
    location.reload();
}