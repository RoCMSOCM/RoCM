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
    table.append($("<thead><tr>"));

    table = $("#" + table_id);

    //Parameter values row
    table.append($("<tbody><tr>"));

    for(var i=0;i<n;i++){   
        add_param(table_id, keys[i]);

    }
    $("input").superScript();
}

function add_param(table_id, param_name) {

    var value = PARAMS.get(param_name);
    var units = PARAMS.getParam(param_name).units;
    var html_parameter = formatExponential(value);// + " " + units;
    // html_parameter = html_parameter.trim();
    
    var table = $("#" + table_id + " thead tr");
        
    var column_name = formatted_map[param_name];
    if(column_name === undefined)
        column_name = param_name;
    table.append($("<th>")
        .html(column_name));

    table = $("#" + table_id + " tr:last");
    table.append($("<td><em>")
        .append($("<input>")
            .attr("type", "text")
            .attr("id", param_name.replace(/\s/, "_") + "_param_value")
            .attr("onclick", "update_original('" + param_name + "')")
            .css("border", "0")
            .css("width", "75px")
            .val(html_parameter)
        ));
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

function update_param_table(param_name) {
    if(PARAMS[param_name] === undefined)
        return;

    // For derived parameters (ex: mass_light_ratio)
    update_derived_elements(param_name);

    var param = PARAMS.getParam(param_name);

    var table_id = format_name(param_name.replace(/\s/, "_")) + "_param_value";

    var value = param.value; 
    var units = param.units;

    var formatted_parameter = formatExponential(value);// + " " + units;

    $("#" + table_id).val(formatted_parameter);

    $("input").superScript();
}


function test_setting() {

    // PARAMS.set("N*", new Param(4.1));

    // add_param("chi_table", "N*");

    
}
;
