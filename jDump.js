/**
 * jDump.js v1  Derek Webb: Coral Technology Group llc
 * 
 * Creates dumpout out of data objects
 * 
 * Will create viewer screen to inspect all calls if more than one
 *  occured during run time.
 * 
 * Arguments:
 * - obj  // object to dump
 * - name // [optional] name to display in viewer
 * - conf // [optional] object with additional settings
 * - - conf.depth  // used to limit the recurse depth 
 * - - conf.parent // passed in to add parent object names in child object lines
 * - - conf.rec    // use recursion?
 * - - conf.jq     // use jQuery display?
 * - - conf.name   // name to use in viewer - only used in constructing viewer (currently ;)
 */
function dump(obj, name, conf) {
	
	if (conf == undefined) conf = {};
	if (typeof name == 'object') conf = name;
	if (typeof name == 'string') conf.name = name;
	
	if (conf.jq == undefined || !conf.jq || !$) {
		conf.jq = true;
	}
	if (conf.depth == undefined) conf.depth = 3;
	if (conf.rec == undefined) conf.rec = false;
	
	if (!conf.rec && (typeof obj != 'object')) { 
		item = {}; 
		item[typeof obj] = obj; 
		obj = item; 
	}
	
	if (conf.parent == undefined) conf.parent = '';
	else conf.parent = conf.parent + ' > ';
	
	if (conf.name == undefined) conf.name = 'Unnamed';
			
	var dumpSettings = {};
	if ($ && conf.jq) {
		dumpSettings = {
			'object':  { 
				'head': '<div class="dumpItem dumpObjHead">', 
				'object': '<div class="dumpItem dumpObj">'
			},
			'string':  '<div class="dumpItem dumpStr">',
			'number':  '<div class="dumpItem dumpNum">',
			'function': '<div class="dumpItem dumpFunc">',
			'boolean' : '<div class="dumpItem dumpBool">',
			'header'  : '<div class="dumpItem dumpHeader">',
			'lineEnd': '</div>'
				
		};
		// called for each dumpOut - used in jq mode only
		var dumpMenuClick = function(id) {
			$('.dumpViewer #dumpMenuItem-'+id).click(function(event) { // click the menu to close all dumpOuts and open the requested one.
				var dumpOutId = $(this).attr('rel'); // capture the dumpOut id 
				$dumpOutOpen = $('.dumpOutOpen'); // the list of dump outputs
				if ($dumpOutOpen.length && (dumpOutId != $dumpOutOpen.attr('id'))) {
					$dumpOutOpen.slideUp(350, function() {
						$('#'+dumpOutId).slideDown(350).addClass('dumpOutOpen');
					}).removeClass('dumpOutOpen');
				}
				else if ($dumpOutOpen.length == 0) {
					$('#'+dumpOutId).slideDown(350).addClass('dumpOutOpen');
				}
			});
		};
	}
	else {
		dumpSettings = {
		'object': { 
				'head': 'Object head', 
				'object': 'Object'
			},
			'string':  'String',
			'number':  'Number',
			'function': 'Function',
			'boolean' : 'Boolean',
			'header'  : 'Name',
			'lineEnd': '\n'
		};
	}
	
	var items = new Array();
	
	//  Add name header here... Top level only	
	if (conf.rec == false) items.push(dumpSettings.header + conf.name + dumpSettings.lineEnd);
	
	// Loop through all items in object
	for (item in obj) {
		
		if (typeof obj[item] != 'object') {
			// We have jquery and can use it?  Text based looks best with item type at the end...
			if ($ && conf.jq) items.push(dumpSettings[typeof obj[item]] + conf.parent + item + ': '+ obj[item] + dumpSettings.lineEnd);
			else items.push(conf.parent + item + ': '+ obj[item] + ' ['+ dumpSettings[typeof obj[item]] + '] ' + dumpSettings.lineEnd);
		}
		
		if (typeof obj[item] == 'object') { 
			if ($ && conf.jq) items.push(dumpSettings['object'].head + conf.parent + item + ': [Object]' + dumpSettings.lineEnd);
			else items.push(conf.parent + item + ': [Object]' + dumpSettings.lineEnd);
			if (conf.depth - 1 >= 0) {
				// Build recursing conf object
				c = {'depth': conf.depth - 1, 'rec': true, 'parent': conf.parent + item};
				
				// Use of jQuery means we have standard line ends
				if ($ && conf.jq) items.push(dumpSettings['object'].object + dump(obj[item], c) + dumpSettings.lineEnd);
				else items.push(dump(obj[item], c)); // alert('No line ends on object contents!');
			}
			else break;
		}
	}
	items = items.join('');
	if (!items) {
		items = obj;
	}
	if (conf.rec == true) { // Only first call creates dumpout
		return items;
	}
	
	if ($ && conf.jq) { // this must be called after the return from recursing ( after if (rec == true) return items; )
		$dumpOut = $('.dumpOut'); // list of dump out screens
		$dumpViewer = $('.dumpViewer'); // viewer containing dumpouts and dump tabs (will not exist on first call)
		
		// Number of dump items already created
		var len;
		
		if ($dumpOut) len = $dumpOut.length;
		else len = 0; 
		
		var dumpId = 'dumpOut-' + len; // create id for each
		
		// If len is 1 then we have one to move...
		if (len == 1) {
			// Create viewer: contains the dumpOuts
			$('body').append(
					'<div class="dumpViewer">'+
						'<div class="closeViewer">jDump v1.0 <span>Close[X]</span></div>'+
						'<div class="dumpMenu"></div>'+
						'<div class="dumpScreen"></div>'+
					'</div>');
			
			// Refresh the dumpViewer jq object
			$dumpViewer = $('.dumpViewer'); 
			
			// Move the first dump item to the viewer
			//  since it is the first, it will not be closed; thus, we add open class
			$first = $('.dumpOut').addClass('dumpOutOpen').appendTo('.dumpViewer .dumpScreen');
							
			// Add item to menu - no menu item is added on first call
			$('.dumpViewer .dumpMenu').append('<div class="dumpMenuItem" rel="dumpOut-0" id="dumpMenuItem-0">' + $first.children('.dumpHeader').text() + '</div>');
			
			// first item menu click event
			dumpMenuClick(0);
		}
		
		// Attach latest dump if this is not the first
		if ($dumpViewer.length) {
			$('.dumpViewer .dumpMenu').append('<div class="dumpMenuItem" rel="'+dumpId+'" id="dumpMenuItem-' + len + '">'+conf.name+'</div>');
			$('.dumpViewer .dumpScreen').append('<div class="dumpOut" id="'+dumpId+'" style=""><div class="closeDump">x</div>'+items+'</div>');
		}
		// There is no viewer (must be the first call (only call))
		else $('body').append('<div class="dumpOut" id="'+dumpId+'" style=""><div class="closeDump">x</div>'+items+'</div>');
		
		
		// Interactions - clickability etc
		//  Data object
		$('#'+dumpId+' .dumpObj').slideToggle(0); // button up the objects
		$('#'+dumpId+' .dumpObjHead').click(function() { $(this).next('.dumpObj').slideToggle(300); }); 
		$('#'+dumpId+' .closeDump').click(function() { $(this).parent('.dumpOut').slideToggle(100).removeClass('dumpOutOpen'); });
		
		// Viewer screen
		if (len > 0) $('#'+dumpId).slideToggle(0); // button up the dumpOut screens 
		$('.dumpViewer .closeViewer span').click(function() { $(this).parents('.dumpViewer').remove(); });
		
		// Menu item clickability
		dumpMenuClick(len);
		
		
		// Component styles CSS
		//  Data - always present - some things (position may need overriding in viewer styles
		$('.dumpOut').css({
			'position': 'absolute', 
			'top': '15%', 
			'left': '25%', 
			'width': '48%', 
			'background': '#d0d0d0', 
			'border': '1px solid #222', 
			'padding': '1%' 
		});
		$('.closeDump').css({
			'text-align': 'center', 
			'background': 'red', 
			'color': '#fff', 
			'position': 'absolute', 
			'top': '25px', 
			'right': '-25px', 
			'display': 'block', 
			'width': '25px', 
			'height': '25px',
			'cursor': 'pointer'
		});
		$('#'+dumpId+' .dumpItem').css({'padding': '3px'});
		$('#'+dumpId+' .dumpObj').css({'background': '#F7E4AB', 'border': '1px solid #C4A33F'});
		$('#'+dumpId+' .dumpObjHead').css({'background': '#F2D98F', 'border': '1px solid #C4A33F', 'cursor': 'pointer'});
		$('#'+dumpId+' .dumpNum').css({'background': '#C7E2FC', 'border': '1px solid #498DD1'});
		$('#'+dumpId+' .dumpStr').css({'background': '#D2FCD4', 'border': '1px solid #3DD447'});
		$('#'+dumpId+' .dumpFunc').css({'background': '#F8EBFA', 'border': '1px solid #CB76D6'});
		$('#'+dumpId+' .dumpBool').css({'background': '#FADEE2', 'border': '1px solid #ED95A0'});
		
		
		//  Viewer - only present after two or more dumps have been called
		if ($dumpViewer.length) {
			// dumpOut overrides for screen view
			$('.dumpOut').css({
				'position': 'relative', 
				'width': '98%',
				'left': '0',
				'top': '0'					
			});
			$dumpViewer.css({
				'position': 'absolute',
				'top': '15%',
				'left': '20%', // extra room for tabs
				'width': '60%',
				'background': '#e0e0e0',
				'border': '3px dashed #777',
				'padding': '10px'
			});
			$dumpViewer.children('.dumpMenu').css({
				'float': 'left',
				'background': '#a0a0a0',
				'width': '20%'
			});
			$dumpViewer.find('.dumpMenuItem').css({
				'border': '1px solid #777',  
				'margin-bottom': '-1px',
				'padding': '3px',
				'cursor': 'pointer'
			});
			$dumpViewer.children('.dumpScreen').css({
				'float': 'left',
				'width': '79.8%'
			});
			$('.dumpViewer .closeViewer span').css({
				'float': 'right',
				'cursor': 'pointer'
			});
		}
	}
	// No jquery
	else alert(items);
	
}
