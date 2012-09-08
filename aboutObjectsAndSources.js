// Objects in Javascript - the only normal way - using a function as an object class.
// ==================================================================================

//
// This is just how javascript is speced. A naive function definition can be used for instantiating objects.
// In fact, that's the most normal way to spawn your own objects (unless using some library framework for that purpose).
// A function definition in Javascript is a constructor for instantiating objects. It can use arguments 
// for constructing the object, as seen below using the supplied 'value' argument.
// All values and functions defined on it's this identifier, are passed when instantiating.
// It's as if a function defines an object type. 
// This is how it looks:
//

// Object type definition
function a(value) {
    this.a = value;
	this.myFunc = function() { return a*a; };
	}

// The object, can include both properties and functions.
// An instantiated object inherits the properties and methods of the parent constructor object, 
// which also means default language methods and properties are inherited

// methods can be defined for only an instantiated object
// or defined for all instantiated objects, like following
// which just adds a method to the a object type
a.prototype.myFunc2 = function() {return 5;};

//
// to avoid defining methods that overide default Javascript ones, the following function can be used.
// it just adds a method like you would add with plain syntax, but it also checks if that would cause an overide first.
// it won't allow overiding. This here is for protecting the Object type. Omitting the .prototype should
// probably likewise protect method addition for instances rather than object.
// Function is a special built-in internal object. Function.prototype.method adds the method function to any function/object.
//

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

// will add setValue as a method
a.method('setValue', function (value) {
    this.value = value;
    return this;
});

// Instantiation.
var b = new a(0);
b.myFunc(3);
b.toString = function() {return 4;};

debugger;

// this will fail:
a.method('toString', function () {
    return '(' + this.getValue() + ')';
});

//
// Given the nodes.js namespacing alternatives (which are somewhat narrow), it seems that on good way to modularize code and split it between sources, 
// would be to encapsulate all functionality as Objects, and then export the objects like follows
//

exports.a = a;

//
// that would export object a and all its properties and methods, to any source file which would use:
// var a = require('./aboutObjects').a;
//

//
// For browser-side modularization, things work differently. The above won't work.
// If I recall correctly, the browser will load and run all sources, and run-time order management is up to you and otherwise unexpected.
// This is opposed to node.js that will load just one file and will work through the 'require' directive for knowing what else to load and use.
// There's one or more packages for browser-side modularization, one from Google I think, see 
// http://stackoverflow.com/questions/6226894/how-to-split-javascript-code-into-multiple-files-and-use-them-without-including
// or others that safeguard order like Require.JS or other ways, discussed here -
// http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
// http://stackoverflow.com/questions/5271663/sharing-a-js-functions-between-code-in-2-files
// 

//
// Some of the source code here was adapted from http://www.crockford.com/javascript/inheritance.html;
// node inspiration is quite incidentally drawn from Github vogue.
//