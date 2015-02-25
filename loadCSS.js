/*!
loadCSS: load a CSS file asynchronously.
[c]2014 @scottjehl, Filament Group, Inc.
Licensed MIT
*/
function loadCSS( href, before, media, callback ){
	"use strict";
	// Arguments explained:
	// `href` is the URL for your CSS file.
	// `before` optionally defines the element we'll use as a reference for injecting our <link>
	// By default, `before` uses the first <script> element in the page.
	// However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
	// If so, pass a different reference element to the `before` argument and it'll insert before that instead
	// note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
	var ss = window.document.createElement( "link" );
	var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
	var sheets = window.document.styleSheets;
	var waitForOnload = false;
	var triggered = false;
	var onload = function() {
		if( !triggered ) {
			ss.media = media || "all";
			triggered = true;
		}
		( callback || function() {} )();
	};

	ss.rel = "stylesheet";
	ss.href = href;
	// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
	ss.media = "only x";
	// IE8 uses onload but does not match defined below?
	// TODO try the href method again
	ss.onload = onload;
	// inject link
	ref.parentNode.insertBefore( ss, ref );
	// This function sets the link's media back to `all` so that the stylesheet applies once it loads
	// It is designed to poll until document.styleSheets includes the new sheet.
	function toggleMedia( first ){
		var defined;
		for( var i = 0; i < sheets.length; i++ ){
			if( sheets[ i ].ownerNode === ss ) {
				defined = true;
			}
		}

		if( defined ){
			// Gecko adds to document.styleSheets immediately,
			// even before the request is finished. So if this happens
			// we’ll wait for the onload to fire for callbacks.
			if( first ) {
				waitForOnload = true;
			}
			if( !waitForOnload ) {
				onload();
			}
		}
		else if( !triggered ) {
			setTimeout( toggleMedia );
		}
	}
	toggleMedia( true );
	return ss;
}