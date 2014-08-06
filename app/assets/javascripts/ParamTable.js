// Create parameter table for the current parameters for the selected galaxy.

function filter_parameters(data){
   filtered_data = {
    distance: data.distance, 
    luminosity: data.luminosity,
    scale_length: data.scale_length,
    mass_hydrogen: data.mass_hydrogen,
    mass_disk: data.mass_disk,
    mass_light_ratio: data.mass_light_ratio
    }

    return filtered_data;
}

function create_param_table(table_id, data){
    var keys = Object.keys(data);
    var n = keys.length;

    var table = $("#" + table_id);

    // Headers row
    var header = $("<thead><tr>");
    table.append(header);

    table = $("#" + table_id);

    //Parameter values row
    table.append($("<tbody><tr>"));

    for(var i=0;i<n;i++){   
        add_param_to_table(table_id, keys[i], data);

    }
    $("input").superScript();

    table.draggable().addClass("draggable").data({
        'originalLeft': table.css('left'),
        'origionalTop': table.css('top')
    });
}

function add_param_to_table(table_id, param_name, data) {

    var value = data[param_name];
    var html_parameter = formatExponential(value);
    
    var table = $("#" + table_id + " thead tr");
        
    var include_units = true;
    var include_breaks = true;
    var column_name = get_formatted_parameter(param_name, include_units, include_breaks);
    if(column_name != param_name)
        column_name = column_name + "<br><font size='1'>(" + param_name + ")</font>";

    var header = $("<th>")
        .html(column_name)
        .attr("class", "param_table_header")
        .attr("id", param_name.replace(/\s/, "_") + "_param_header")
        .on("click", function() {
            update_original(param_name);
        });

    if(param_name.contains(chi_squared_string)){
        var id = "objective_model_toggle"
        var objective_model_toggle = $("<input/>")
            .attr("class", "auto_obj_test")
            .attr("type", "radio")
            .attr("name", "objective_model")
            .attr("id", param_name.replace(chi_squared_string,"").trim() + "_objective");

        header.prepend(objective_model_toggle);

        $("#" + id).change(function() {

        });
    }
    table.append(header);
    table = $("#" + table_id + " tr:last");
    table.append($("<td><em>")
        .attr("id", param_name.replace(/\s/, "_") + "_param_value_wrapper")
        .append($("<input>")
            .attr("type", "text")
            .attr("id", param_name.replace(/\s/, "_") + "_param_value")
            .css("border", "0")
            .css("width", "75px")
            .keyup(resizeInput)
            .keypress(function(e) {
                handle_input_keypress(this, e, param_name);
            })
            .val(html_parameter)
        ));
}

function remove_param_from_table(table_id, param_name) {
    $("#" + table_id + " #" + param_name + "_param_header").remove(); 
    $("#" + table_id + " #" + param_name + "_param_value_wrapper").remove(); 
}

function create_chi_table() {
    var data = [];

    for(var model in GMODEL) {
        if(model != "DARK"){
            var chi_model = model + " χ²";
            PARAMS.initialize(chi_model, 0);
            data[chi_model] = 0;
        }
    }

    var table_id = "chi_table";
    create_param_table(table_id, data);
    update_chi_squared();
}

function update_param_table_with_data(data) {
    var keys = Object.keys(data);

    for(var i=0;i<keys.length;i++) {
        var k = keys[i];
        update_param_table(k);
    }
}


function update_param_table(param_name) {
    if(param_name === undefined || PARAMS.get(param_name) == null)
        return;

    // For derived parameters (ex: mass_light_ratio)
    update_derived_parameters(param_name);

    var param = PARAMS.getParam(param_name);

    var table_id = format_name(param_name.replace(/\s/, "_")) + "_param_value";

    var value = param.value; 
    var units = param.units;

    var formatted_parameter = formatExponential(value);// + " " + units;

    $("#" + table_id).val(formatted_parameter);

    $("input").superScript();
}

// Dynamically resize the input text field
function resizeInput() {
    var value = $(this).val();
    var len = value.length;

    if(value.contains("x")) // from formatExponential() (2.01x10<sup>8</sup>)
        len = 8;
    else if(+value == 0){
        len = 1;
    }

    var chopped_len = len - 2;
    if(chopped_len <= 0)
        chopped_len = len;

    $(this).attr('size', len);
}