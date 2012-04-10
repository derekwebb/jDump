jDump is a utility written to help inspect the results of JavaScript
objects.  jDump is far superior to alerts() (When used with jQuery) since it
creates a responsive viewscreen where you can review the results of the calls to
jDump in sequence.

To use, simply add the jDump.js file to the page (before whatever file you are
debugging) and call it like so:

dump(obj, (opt)name, (opt)conf);

Multiple calls within program execution are grouped and their data used to
construct a useful data inspection tool.

Arguments:
 - obj  // object to dump
 - name // [optional] name to display in viewer
 - conf // [optional] object with additional settings
 - - conf.depth  // used to limit the recurse depth 
 - - conf.parent // passed in to add parent object names in child object lines
 - - conf.rec    // use recursion?
 - - conf.jq     // use jQuery display?
 - - conf.name   // name to use in viewer


Examples:

* The most basic usage
dump(obj);


* Or, if you want to change the recusion depth:
dump(obj, {depth: 3});


* I like to use line numbers (and file names) for names to pass
dump(obj, LineN);


