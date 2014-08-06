function create_data_table(table_id)
{
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
	} );

	// Citations sub-table and SOCM call
	d3.json("http://socm.herokuapp.com/citations.json?page=false", function(error, data){
		$("#" + table_id + " tbody").on('click', '.citation', function () {
			var tr = $(this).closest('tr');
			var row = table.row( tr );

			if ( row.child.isShown() ) {
	            // This row is already open - close it
	            row.child.hide();
	            tr.removeClass('shown');
	        }
	        else {
	            // Open this row
	            row.child( create_citations_table(data) ).show();
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
					prefix = "<button class='citation'>";
					suffix = "</button>";
				}
				
				row.append($("<td/>").html(prefix + row_data + suffix))

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

	$(".citation").button().addClass("default_button");
	$(".plot").button({
		icons: {
	        primary: "ui-icon-image"
	      }
	}).click(function() {
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
	});

	$(".download").button({
		icons: {
	        primary: "ui-icon-disk"
	      }
	}).click(function() {
		var id = this.id;
		var gid = id.split("-DOWNLOAD")[0];	
		var gname = this.name;

		var vel_download_url = "http://socm.herokuapp.com/galaxies/" + gid + "/velocities.json";
		var param_download_url = "http://socm.herokuapp.com/galaxies/" + gid + ".json";

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
		d3.json(param_download_url, function(error, data) {
			delete data.id;
			
			JSON2CSV([data], gname+"-PARAMETERS");
		});
	});

	create_data_table(table_id);
}

function create_dropdown_div(div_id, button_id, direction) {
	var button = $("#" + button_id);
	
	var compass = "";

	direction == "up" ? compass = "n" : compass = "s";

	button.button({
		icons: {
			secondary: "ui-icon-triangle-1-"+compass
		}
	});
	
	button.click(function () {

		close_all_dropdowns(div_id);

		$("#"+div_id).slideToggle({
			direction: direction
		},'1000');

		$(this).data('state', ($(this).data('state') == 'up') ? 'down' : 'up');
		

		// Button name changes based on 'Show' and 'Hide'
		var button_text = $(this).button("option","label");

		if(button_text.contains("Show")){
			button_text = button_text.replace("Show", "Hide");
		}
		else if(button_text.contains("Hide")) {
			button_text = button_text.replace("Hide", "Show");
		}

		$(this).button("option", "label", button_text);

		var _compass = "";
		compass == "s" ? _compass = "n" : _compass = compass;
		button.button("option", {
			icons: {
				secondary: ($(this).data('state') == "up") ? "ui-icon-triangle-1-"+_compass : "ui-icon-triangle-1-"+compass
			}
		});
	});
}

function close_all_dropdowns(div_id) {
	var dropdowns = $(".dropdown");
	for(var i=0;i<dropdowns.length;i++) {
		if($(dropdowns[i]).attr("id") != div_id){
			$(dropdowns[i]).css("display", "none");
		}
	}
}


function create_citations_table(citations_in) {
	//TODO: Associate by the galaxies id
	// Get all parameter_citations
	// Check if no mass_hydrogen_citation -> NA (N/A)
	// Check if no scale_length_citation -> ES (Estimated)

    var table_tag = '<table class="citation" '
    	+ 'cellpadding="5" '
    	+ 'cellspacing="0" '
    	+ 'border-collapse="collapse" '
    	+ 'style="padding-left:50px;padding-top:10px;">';

    var ids = [23, 24, 24, 25];
    var parameters_in = {'velocities_citation': 'v',
    	'luminosity_citations': FORMATTED_MAP.luminosity.name,
    	'scale_length_citation': FORMATTED_MAP.scale_length.name,
    	'mass_hydrogen_citation': FORMATTED_MAP.mass_hydrogen.name
	};

	// Test citations in case SOCM citations is dropped.
	// var c1 = {
 //    	author: 'R. Kuzio de Naray, S. S. McGaugh and W. J. G. de Blok',
	// 	journal: 'Ap. J.',
	// 	volume: '676',
	// 	pages: '920',
	// 	year: '2008'
	// };
	// var c2 = {
 //    	author: 'W. J. G. de Blok and A. Bosma',
	// 	journal: 'A. A.',
	// 	volume: '385',
	// 	pages: '816',
	// 	year: '2002'
	// };
	// var c3 = {
 //    	author: 'W. J. G. de Blok and A. Bosma',
	// 	journal: 'A. A.',
	// 	volume: '385',
	// 	pages: '816',
	// 	year: '2002'
	// };
	// var c4 = {
 //    	author:'J. M. Stil and F. P. Israel',
	// 	journal: 'A. A.',
	// 	volume: '389',
	// 	pages: '29',
	// 	year: '2002'
	// };
	// var citations_in = [c1,c2,c3,c4];

    var num_citations = citations_in.length;
    var max_citations = 4;
	var citations = [];
	var bold_volume = true;
	var italic_journal = false;

	for(var c = 0; c < max_citations; c++){
		// Gets random citation from the SOCM citations.json
		var rand_id = Math.floor(Math.random() * (num_citations-1)) + 1;

		var author_in = citations_in[rand_id].author;
		var journal_in = citations_in[rand_id].journal;
		var volume_in = citations_in[rand_id].volume;
		var pages_in = citations_in[rand_id].pages;
		var year_in = citations_in[rand_id].year;

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

    return citation_table;
}