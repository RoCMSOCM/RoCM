// ParamList.js

var immutable_parameters = [
	"galaxy_name",
	"galaxy_type",
	"id",
	"citation_ids_array",
	"Functions",
	"vrot_data_last",
	"velocities_count",
	"r_last",
	"mass_light_ratio",
	"universal_constant"]

function find_all_parameters(exclude_sliders) {
	exclude_sliders === undefined ? exclude_sliders = false : exclude_sliders = exclude_sliders;

	var parameters = PARAMS.getDict();

	var slider_params;
	if(exclude_sliders)
		slider_params = find_parameter_slider_names();

	var return_params = [];

	for(var param in parameters) {
		if(param[0] != "_" && !param.contains("χ²") && !immutable_parameters.contains(param)){
			if(exclude_sliders){
				if(!slider_params.contains(param))
					return_params.push(param);
			}
			else
				return_params.push(param);
		}
	}

	return return_params;
}


// List of parameters dialog menu.
// Activates when user clicks the + button in the Parameter Fitting Sliders section
function create_parameter_list_dialog() {

	$("#sliders").append(
		$("<div>")
			.attr("id", "param_list_dialog")
			.attr("title", "Parameters")
	);

	$("#param_list_dialog").dialog({
      modal: true,
      autoOpen: false,
      width: 400,
      buttons: {
        Add: function() {
        	add_param_from_list();
        	update_slider_configuration();
			$(this).dialog("close");
        }
      }
    });
}

function update_parameter_list_dialog() {
	var parameters = find_all_parameters(true);

	var dialog = $("#param_list_dialog");

	dialog.empty();
		
	var list = $("<ol>").attr("id", "param_list");

	for(var i=0;i<parameters.length;i++){
		var html_param = get_both_parameter_formats(parameters[i]);

		list.append($("<li>")
			.attr("class", "ui-widget-content")
			.html( html_param ));
	}

	if(parameters.length == 0){
		dialog.append($("<span>")
			.text("No parameters available"));
	}

	dialog.append(list);

	$("#param_list").bind("mousedown", function(e) {
	  e.metaKey = true;
	}).selectable();
}

function fire_parameter_list_dialog() {
	$("#param_list_dialog").dialog('open');
}

function add_param_from_list() {
	$(".ui-selected").each(function() {
		var text = $(this).text();
		var split = text.split(":");

		var param = split[0];

		$("#slider_" + param + "_remove").click();
		new ParamSlider(param);
	});
}