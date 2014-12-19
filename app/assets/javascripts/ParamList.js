// ParamList.js

$(document).ready(function() {
	var dialog_id = "param_list_dialog";

	var add_func = {Add: function() {
        	add_param_from_list(dialog_id);
        	update_slider_configuration();
			$(this).dialog("close");
		}
	};

	// The list of parameters to add as sliders
	create_dialog(dialog_id, "Parameters", add_func);

});

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
		if(param[0] != "_" && !param.contains(chi_squared_string) && !immutable_parameters.contains(param) && !param.contains("citation")){
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
function create_dialog(dialog_id, title, button_fnc) {

	$("#sliders").append(
		$("<div>")
			.attr("id", dialog_id)
			.attr("title", title)
	);

	$("#" + dialog_id).dialog({
      modal: true,
      autoOpen: false,
      width: 400,
      buttons: button_fnc
    });
}

function update_list_dialog(dialog_id, data, empty_message) {
	var dialog = $("#" + dialog_id);

	dialog.empty();
		
	var list_id = dialog_id + "_list";
	var list = $("<ol>").attr("id", list_id).attr("class", "ui_list");
	list.addClass("ui_list");

	for(var i=0;i<data.length;i++){
		var item = $("<li>")
			.attr("class", "ui-widget-content")
			.html( data[i] )
		item.addClass(dialog_id + "_item");
		list.append(item);
	}

	if(data.length == 0){
		dialog.append($("<span>")
			.text(empty_message));
	}

	dialog.append(list);

	list.bind("mousedown", function(e) {
		e.metaKey = true;
	}).selectable();

	$("button").addClass("default_button");
}

function fire_dialog(dialog_id) {
	$("#" + dialog_id).dialog('open');
	$(".ui-dialog-buttonset button").removeClass();
	$(".ui-dialog-buttonset button").addClass("default_button");
}

function add_param_from_list(dialog_id) {
	$("li.ui-selected." + dialog_id + "_item").each(function() {
		var text = $(this).text();
		var split = text.split(" ");

		var param = split[0];

		$("#slider_" + param + "_remove").click();
		new ParamSlider(param);
	});
}