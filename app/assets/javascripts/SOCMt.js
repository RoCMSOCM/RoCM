function create_data_table()
{
	var table = $("#galaxy_table").DataTable( {
		"language": {
			"lengthMenu": "Display _MENU_ galaxies",
			"info": "Showing _START_-_END_ of _TOTAL_ galaxies"
		},
		"aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
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

	$('#galaxy_table tbody').on('click', '.reference', function () {
		var tr = $(this).closest('tr');
		var row = table.row( tr );

		if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
}


function create_table(galaxiesJson) {
	d3.json(galaxiesJson, function(error, data) {
		data.forEach(function(d) {
			d.Functions = "<button class='plot'>Plot</button> | <button class='download'>Download</button>"
		});

		keys = Object.keys(data[0]);

		rows = data.length;
		cols = keys.length;

		var table = $("<table/>")
		.attr("id", "galaxy_table")
		.attr("class", "display")
		.attr("text-align", "right")
		.attr("cellspacing", 0)
		.attr("width", "100%");

		var thead = $("<thead/>");

		for (var r = 0; r < rows + 1; r++) {
			var row = $("<tr/>");
			for (var c = 0; c < cols; c++) {
				if (r == 0) {
					row.append($("<th/>").html(keys[c]))
				} else {
					// Use [r-1] because d3 already takes the csv header out (the <th> tag)
					var row_data = data[r-1][keys[c]]
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
		$(".plot").button();
		$(".download").button();
		
		create_data_table();
	});
}

function create_dropdown_div(div_id, button_id, direction) {
	var table_button = $("#" + button_id);

	var compass = "";

	direction == "up" ? compass = "n" : compass = "s";

	table_button.button({
		icons: {
			secondary: "ui-icon-triangle-1-"+compass
		}
	});
	
	table_button.click(function () {
		$("#"+div_id).slideToggle({
			direction: direction
		},'1000');

		$(this).data('state', ($(this).data('state') == 'up') ? 'down' : 'up');
		var _compass = "";
		compass == "s" ? _compass = "n" : _compass = compass;
		table_button.button({
			icons: {
				secondary: ($(this).data('state') == "up") ? "ui-icon-triangle-1-"+_compass : "ui-icon-triangle-1-"+compass
			}
		});
	});
}


function format ( d ) {
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