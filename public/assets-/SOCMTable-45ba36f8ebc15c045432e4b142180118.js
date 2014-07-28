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

	$("#" + table_id + " tbody").on('click', '.reference', function () {
		var tr = $(this).closest('tr');
		var row = table.row( tr );

		if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format_references(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
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
				var column_name = get_formatted_parameter(keys[c]);
				if(column_name != keys[c])
					column_name = column_name + "<br><font size='1'>(" + keys[c] + ")</font>";
				row.append($("<th/>").html(column_name));
			} else {
				// Use [r-1] because d3 already takes the csv header out (the <th> tag)
				var row_data = param_data[r-1][keys[c]];
				var prefix = "";
				var suffix = "";

				// if(row_data.contains("[")){
				// 	prefix = "<button class='reference'>";
				// 	suffix = "</button>";

				// }
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

	$(".reference").button();
	$(".plot").button({
		icons: {
	        primary: "ui-icon-image"
	      }
	}).click(function() {
		localStorage.removeItem("PARAMS");
		var id = this.id;
		var galaxy_name = id.split("-PLOT")[0];	
		
		GLOBAL_BULGE = default_bulge(galaxy_name);

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

		var vel_download_url = socm_url + "/" + gid + "/velocities.json";
		var param_download_url = socm_url + "/" + gid + ".json";

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


function format_references( d ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border-collapse="collapse" style="padding-left:50px;padding-top:10px;">'+
    '<tr>'+
	    '<td>[23]</td>'+
	    '<td>v</td>'+
	    '<td>R. Kuzio de Naray, S. S. McGaugh and W. J. G. de Blok, Ap. J. 676, 920 (2008).</td>'+
    '</tr>'+
    '<tr>'+
	    '<td>[24]</td>'+
	    '<td>L</td>'+
	    '<td>W. J. G. de Blok and A. Bosma, A. A. 385, 816 (2002).</td>'+
    '</tr>'+
    '<tr>'+
	    '<td>[24]</td>'+
	    '<td>R<sub>0</sub></td>'+
	    '<td>W. J. G. de Blok and A. Bosma, A. A. 385, 816 (2002).</td>'+
    '</tr>'+
    '<tr>'+
	    '<td>[25]</td>'+
	    '<td>HI</td>'+
	    '<td>J. M. Stil and F. P. Israel, A. A. 389, 29 (2002).</td>'+
    '</tr>'+
    '</table>';
}
;
