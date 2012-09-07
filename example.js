Function.prototype.method = function (name, func) {
	if (this.prototype[name])
	{
		var e = "Object " + this.name + " already has the prototype property/function " + name + " defined for it.";
		throw e;
		return null;
	}
	else
	{
	this.prototype[name] = func;
    return this;
	}
};

function Parenizor(value) {
    this.setValue(value);
}

Parenizor.method('setValue', function (value) {
    this.value = value;
    return this;
});

Parenizor.method('getValue', function () {
    return this.value;
});

Parenizor.method('MytoString', function () {
    return '(' + this.getValue() + ')';
});

myParenizor = new Parenizor(0);
debugger;