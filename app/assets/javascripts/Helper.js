function sleep(millis, callback) {
	setTimeout(function()
		{ callback(); }
		, millis);
}

function formatting(string) {
	return string.replace("&gt;", />/g).replace("&lt;", /</g);
}

function is(d, string) {
	return d.name ? d.name.toLowerCase().contains(string) : d.toLowerCase().contains(string);
}

String.prototype.contains = function(value) {
	return this.indexOf(value) != -1;
}

String.prototype.prefix = function(value) {
	return this.indexOf(value);
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function println(p) {
	console.log(p);
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function getAbsPos (obj){ // obj is jQuery object
    var pos = { x: 0, y: 0 };
    while(obj.length != 0){
      if(obj.attr !== undefined && !isNaN(obj.attr("x")) && !isNaN(obj.attr("y"))) {
          pos.x += +obj.attr("x");
          pos.y += +obj.attr("y");
        }

      obj = obj.parent();   
    }
    return pos;
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

String.prototype.truncateAfter = function(truncating_pivot) {
    if( !this.contains(truncating_pivot) || this.endsWith(truncating_pivot))
        return this.toString();
    else {
        var remove = this.substring(this.indexOf(truncating_pivot) + truncating_pivot.length);
        return this.replace(remove, "");
    }   
}

String.prototype.truncateBefore = function(truncating_pivot) {
    if( !this.contains(truncating_pivot) || this.endsWith(truncating_pivot))
        return this.toString();
    else {
        var remove = this.truncateAfter(truncating_pivot);
        return this.replace(remove, "");
    }   
}