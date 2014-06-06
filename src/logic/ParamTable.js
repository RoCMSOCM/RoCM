// Create parameter table for the current parameters for the selected galaxy.

function create_param_table(div_id, data){
    data = data[0];

    var keys = Object.keys(data);
    var n = keys.length;

    var table = $("#" + div_id);

    table.append($("<thead><tr>"));

    table = $("#" + div_id + " tr:last");
    for(var i=0;i<n;i++){

        table.append($("<th>")
            .html(keys[i]));
    }

    table = $("#" + div_id);
    table.append($("<tbody><tr>"));

    table = $("#" + div_id + " tr:last");

    for(var i=0;i<n;i++){    

        table.append($("<td><em>")
            .html("<code>" + data[keys[i]] + "</code>")
            );
    }
}