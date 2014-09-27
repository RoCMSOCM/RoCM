function create_data_table(table_id)
{
	var row_data = {};

	d3.json("http://socm.herokuapp.com/citations.json?page=false", function(error, data) {
		$("#" + table_id + " tbody tr").each(function () {
			var galaxy_name = $(this).attr("id").replace("SOCM-", "");
			var galaxy_data = SOCMPARAMS[galaxy_name];

			var ids = [
				galaxy_data.velocities_citation, 
				galaxy_data.luminosity_citation, 
				galaxy_data.scale_length_citation, 
				galaxy_data.mass_hydrogen_citation
			];
			
			var citations_data = create_citations_table(ids, data, galaxy_name);
			row_data[galaxy_name] = citations_data;
		});

		var table = $("#" + table_id).DataTable( {
			"language": {
				"lengthMenu": "Display _MENU_ galaxies",
				"info": "Showing _START_-_END_ of _TOTAL_ galaxies"
			},
			"aLengthMenu": [[2, 5, 10, 25, 50, -1], [2, 5, 10, 25, 50, "All"]],
			"iDisplayLength": 5,
			columnDefs: [ {
				targets: [ 0 ],
				orderData: [ 0, 1 ]
			}, {
				targets: [ 1 ],
				orderData: [ 1, 0 ]
			}, {
				targets: [ 4 ],
				orderData: [ 4, 0 ]
			} ]
		});

		$("#" + table_id + " tbody").on('click', '.citation', function () {
			var tr = $(this).closest('tr');
			var galaxy_name = tr.attr("id").replace("SOCM-", "");

			var row = table.row( tr );
			var citations_data = row_data[galaxy_name];

			if ( row.child.isShown() ) {
	            // This row is already open - close it
	            row.child.hide();
	            tr.removeClass('shown');
	        }
	        else {
	            // Open this row
	            row.child(citations_data).show();
	            tr.addClass('shown');
	        }
	    });
    });	
}


function create_socm_table(param_data) {
	keys = Object.keys(param_data[0]);

	rows = param_data.length;
	cols = keys.length;

	var div_id = "socmt_wrapper";

	$("#" + div_id).append($("<h2/>").html("Scholarly Observed Celestial Measurements"));

	var table_id = "galaxy_table";

	var table = $("<table/>")
	.attr("id", table_id)
	.attr("class", "display")
	.attr("text-align", "right")
	.attr("cellspacing", 0)
	.attr("width", "100%");

	var thead = $("<thead/>");

	for (var r = 0; r < rows + 1; r++) {
		var row = $("<tr/>");
		var galaxy_name;
		if(param_data[r-1] !== undefined)
			galaxy_name = param_data[r-1]["galaxy_name"];

		for (var c = 0; c < cols; c++) {
			// Filtered data from the SOCMTable
			if(keys[c] == "id" || keys[c] == "vrot_data_last")
				continue;

			if (r == 0) {
				var include_units = true;
				var include_breaks = true;
				var column_name = get_formatted_parameter(keys[c], include_units, include_breaks);
				if(column_name != keys[c])
					column_name = "<font size='1'>(" + keys[c] + ")</font><br>" + column_name;
				row.append($("<th/>").html(column_name));
			} else {
				// Use [r-1] because d3 already takes the csv header out (the <th> tag)
				var row_data = param_data[r-1][keys[c]];
				var prefix = "";
				var suffix = "";

				if(typeof(row_data) == "string" && row_data.contains("Citation")){
					prefix = "<button class='citation' id='" + galaxy_name + "-CITATION'>";
					suffix = "</button>";
				}
				
				row.append($("<td/>").html(prefix + row_data + suffix))
				row.attr("id", "SOCM-" + galaxy_name);

			}
		}

		if(row[0].firstElementChild.tagName.contains("TH")){
			thead.append(row);
		}
		else{
			table.append(row);
		}
	}

	table.append(thead);

	$("#socmt_wrapper").append(table);	

	$(".plot")
		.click(function() {
			localStorage.removeItem("PARAMS");
			var id = this.id;
			var galaxy_name = id.split("-PLOT")[0];	
			
			GLOBAL_BULGE = default_bulge(galaxy_name);
		    $("#bulge_toggle").prop('checked', GLOBAL_BULGE);

			if(create_curve_plot(galaxy_name, false) != -1){
				close_all_dropdowns();
				var rocm_url = "#GALAXY="+galaxy_name;
				
				window.location.href = rocm_url;
				
				PARAMS.initialize("galaxy_name", galaxy_name);

				update_parameter_sliders();
			}
		}
	);

	$(".parameters_download")
		.click(function() {
			var id = this.id;
			var gid = id.split("-DOWNLOAD")[0];	
			var gname = this.name;

			var param_download_url = "http://socm.herokuapp.com/galaxies/" + gid + ".json";

			d3.json(param_download_url, function(error, data) {
				delete data.id;
				
				JSON2CSV([data], gname+"-PARAMETERS");
			});
		}
	);
	$(".velocities_download")
		.click(function() {
			var id = this.id;
			var gid = id.split("-DOWNLOAD")[0];	
			var gname = this.name;

			var vel_download_url = "http://socm.herokuapp.com/galaxies/" + gid + "/velocities.json";

			d3.json(vel_download_url, function(error, data) {
				data.forEach(function(d) {
				    d.R = d.r;
				    d.VROT_DATA = d.vrot_data;
				    d.VROT_DATA_ERROR = d.vrot_data_error;

				    delete d.r;
				    delete d.vrot_data;
				    delete d.vrot_data_error;
				    delete d.id;
				    delete d.galaxy_id;
				});


				data = sortByKey(data, "R");
				JSON2CSV(data, gname+"-VELOCITY");
			});
		}
	);
	$(".deltav_plot")
		.click(function() {	
			var gname = this.name;

			plot_deltav_reload(gname);
		}
	);

	create_data_table(table_id);
}

function create_dropdown_div(div_id, button_id, direction) {
	var button = $("#" + button_id);
	
	button.click(function () {

		close_all_dropdowns(div_id);

		$("#"+div_id).slideToggle({
			direction: direction
		},'1000');
	});
}

function close_all_dropdowns(div_id) {
	var dropdowns = $(".dropdown_div");
	for(var i=0;i<dropdowns.length;i++) {
		if($(dropdowns[i]).attr("id") != div_id){
			$(dropdowns[i]).css("display", "none");
		}
	}
}


function create_citations_table(ids, data, galaxy_name) {
	// Get all parameter_citations
	// Check if no mass_hydrogen_citation -> NA (N/A)
	// Check if no scale_length_citation -> ES (Estimated)
    var table_tag = '<table class="citation" '
    	+ 'cellpadding="5" '
    	+ 'cellspacing="0" '
    	+ 'border-collapse="collapse" '
    	+ 'style="padding-left:50px;padding-top:10px;">';

    var parameters_in = {'velocities_citation': 'v',
    	'luminosity_citations': FORMATTED_MAP.luminosity.name,
    	'scale_length_citation': FORMATTED_MAP.scale_length.name,
    	'mass_hydrogen_citation': FORMATTED_MAP.mass_hydrogen.name
	};

    var num_citations = data.length;
    var max_citations = 4;
	var citations = [];
	var bold_volume = true;
	var italic_journal = false;

	for(var c = 0; c < max_citations; c++){
		// Gets random citation from the SOCM citations.json
		var id = ids[c];
		
		if(data[id] === undefined){
			// Blank citation
			citations.push("N/A");
			continue;
		}

		var author_in = data[id].author;
		var journal_in = data[id].journal;
		var volume_in = data[id].volume;
		var pages_in = data[id].pages;
		var year_in = data[id].year;

		var and = author_in.split("and");
		and = and.map(function(str) { 
			// Remove outer whitespace
			return str.trim(); 
		});
		var num_authors = and.length;
		var authors = "";
		if(num_authors == 1)
			authors += and[0];
		else if(num_authors == 2)
			authors += and[0] + " and " + and[1];
		else if(num_authors > 2){
			for(var a = 0; a < num_authors; a++) {
				if(num_authors - a == 2){
					authors += and[a] + " and " + and[a+1];
					break;
				}
				else
					authors += and[a] + ", "
			}
		}


		if(italic_journal)
			journal_in = "<i>" + journal_in + "</i>";

		if(bold_volume)
			volume_in = "<b>" + volume_in + "</b>";


		var author = authors.trim();
		var journal = journal_in.trim();
		var volume = volume_in;
		var pages = pages_in;
		var year = year_in;

		citations.push(author + ", " + journal + " " + volume + ", " + pages + " (" + year + ").");
	}

	var parameters = Object.keys(parameters_in);

	// Start with the beginning table tag
    var citation_table = table_tag;
    
    for(var i = 0; i < max_citations; i++){
    	citation_table = citation_table 
    		+ '<tr>' 
    			+ '<td>' + ids[i] + '</td>'
    			+ '<td>' + parameters_in[parameters[i]] + '</td>'
    			+ '<td>' + citations[i] + '</td>'
    		+ '</tr>'
    }

    citation_table = citation_table + "</table>";

    // Set the 'Citations' button to be the array of ids
    $("#" + galaxy_name + "-CITATION").text("[" + ids + "]");
    
    return citation_table;
}