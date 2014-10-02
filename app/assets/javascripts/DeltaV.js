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
        });

        // D.values = D.values.filter(function(dd) {
        //   return dd.R > 18;
        // });

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

$(document).ready(function() { 
  // Actives the DeltaV functionality
  add_click_listener("deltav_button", "ΔV/V Density Plot", "DELTAV");
});

function add_click_listener(button_id, button_text, hashtag_url) {
  // TODO: Dynamically create the menu items
  var dv_button = $("#" + button_id);
  
  var span = dv_button.children();

  dv_button.text(" " + button_text);

  var dv = "#" + hashtag_url;
  if(window.location.href.endsWith(dv))
    dv_button.text(" Rotation Curve Plot");

  dv_button.prepend(span);
  
  dv_button.click(function(){
    plot_deltav_reload(dv);
  });
}


function plot_deltav_reload(id, galaxy_name) {
  var flag = false;

  if(galaxy_name !== undefined) {
    var new_galaxy_url = window.location.href.split("=")[0] + "=" + galaxy_name;
    if(window.location.href.contains(id) && window.location.href.contains(galaxy_name))
      flag = true;
    else
      window.location.href = new_galaxy_url + id;
  }
  else {
    galaxy_name = window.location.href.truncateBefore("=").truncateAfter("#").replace("#", "");
    var new_url = window.location.href.truncateAfter("#") + "GALAXY=" + galaxy_name;

    if( !window.location.href.endsWith(id) ) {
      window.location.href = new_url + id;
    }
    else {
      window.location.href = new_url;
    }
  }


  if( !flag )
    location.reload();
}