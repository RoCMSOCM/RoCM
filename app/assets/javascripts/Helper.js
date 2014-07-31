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