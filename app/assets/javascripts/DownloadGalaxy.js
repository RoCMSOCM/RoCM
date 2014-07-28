function JSON2CSV(objArray, galaxy_name)
{  
  var getKeys = function(obj){
    var keys = [];
    for(var key in obj){
       keys.push(key);
    }
    return keys.join();
  };

  // var objArray = format_json(objArray);
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if(line != '') line += ','

        line += array[i][index];
    }

    str += line + '\r\n';
  }

  str = getKeys(objArray[0]) + '\r\n' + str;

  var a = document.createElement('a');
  var blob = new Blob([str], {'type':'application\/octet-stream'});
  a.href = window.URL.createObjectURL(blob);

  a.download = galaxy_name + '.csv';
  a.click();
  return true;
}