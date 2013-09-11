/**
 * Module for managing display fields
 * @author Patrick Oladimeji
 * @date Dec 5, 2012 : 4:16:16 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, es5: true */
/*global define, d3, require, __dirname, process, _*/

function bbraun_disp_type(regexMatch,stateString)  {

        var cursor_pos = stateString.indexOf("c:=");
	
	// bbraun without cursor is senseless 	
	if ( cursor_pos == -1) 
		return regexMatch;
	var valueAsString = regexMatch.toString(); 
	var delimitator;
	var valueAsNumber =  parseFloat(regexMatch);
	var charAtCursor; 

	// Getting position of the cursor (-2,-1,0,1,2,3,4) 
	if (stateString.charAt(cursor_pos +3 ) == '-')
		cursor_pos = stateString.substring(cursor_pos +3, cursor_pos +5);
	else
		cursor_pos = stateString.charAt(cursor_pos +3);						


	switch( true )   {
						
	//If Value >=1000 no needs processing
	case (cursor_pos < 2 && valueAsNumber < 1000 ):
							
		var arraySplit;
		var finalStr;
						
		if( valueAsNumber < 100 )
			valueAsString = valueAsNumber.toFixed(2).toString();
		else 
			valueAsString = valueAsNumber.toFixed(1).toString();

		arraySplit = valueAsString.split(".");
		finalStr = arraySplit[1];

		if( cursor_pos >= 0)
			finalStr= arraySplit[1].replace(/0/g,"_");

		if( cursor_pos == -1)   {
			if( arraySplit[1][1] == '0')
			finalStr = arraySplit[1][0] + "_"; 

		}
		valueAsString = arraySplit[0] + "." + finalStr;
						    
							
							
		break;

	case (cursor_pos == 2 && valueAsNumber < 1000 && valueAsNumber % 1 == 0):
							

		valueAsString = valueAsNumber.toString() + "._";
						        						
		break;
						
	}	

	var long = valueAsString.length;
	if( valueAsString.indexOf('.') == -1 )
		for( var i= 0; i < 5 - long; i++)
			valueAsString = '_' + valueAsString;

	else	{
	
	        if( valueAsString.substring(valueAsString.indexOf('.')).length == 3)
			for( var i =0; i < 7- long; i++)
				valueAsString = '_' + valueAsString;
		else
			for( var i =0; i < 6- long; i++)
				valueAsString = '_' + valueAsString;
	
		}		    

		if (cursor_pos < 0 )  {
			delimitator = valueAsString.indexOf('.') + Math.abs(cursor_pos);
		        charAtCursor = valueAsString.charAt(delimitator );				

							
		}
		else  {
			if ( valueAsString.indexOf(".") == -1 )  {
				delimitator = valueAsString.length - cursor_pos -1;
				charAtCursor = valueAsString.charAt(delimitator );
			}
			else  {
				delimitator = valueAsString.indexOf('.') - cursor_pos -1 ;
				charAtCursor = valueAsString.charAt(delimitator );				
			}			
													
							
		}

						
		if( charAtCursor == "_" )
			charAtCursor = "0";	

		realStringToUse = valueAsString.substring(0, delimitator) +
				  charAtCursor.fontcolor("#00FF40") +
			          valueAsString.substring(delimitator +1).replace(/[^.]*/,function(a)  {
						if( a.length != 1) {
							return a.replace(/_/g,'0');
                                                } 
						return a; 
			          })

		return realStringToUse;
}

//New Display Type
function alarisGP_disp_type(regexMatch)  {

	var valueAsNumber =  parseFloat(regexMatch);
        var valueAsString ;
	var arraySplit ;
	var check = false;
	var dot_or_nothing = "";
	var firstString; 

	if( valueAsNumber < 100 )  {
		valueAsNumber = valueAsNumber.toFixed(1);
		check = true;
		dot_or_nothing = "."; //Adding dot
	}


	valueAsString = valueAsNumber.toString();

	arraySplit = valueAsString.split(".");
	firstString = arraySplit[0];

	//XXX Warning: <u> is deprecated! Use CSS instead
	if( check == true)
		arraySplit[1] = "<span style='text-decoration:underline'>" + arraySplit[1].fontsize(4) + "</span>";
	else 
		arraySplit[1] = "";

	
	if( valueAsNumber >= 10 )
		firstString = firstString.charAt(0) + "<span style='text-decoration:underline'>" + firstString.substring(1) + "</span>";
	else
		firstString = "<span style='text-decoration:underline'>" + firstString + "</span>" ;

	return firstString + dot_or_nothing + arraySplit[1];
		



}

//NEW display type
function alarisGH_disp_type(regexMatch)  {

	if( regexMatch < 10 )
		return parseFloat(regexMatch).toFixed(2);
	
	if( regexMatch < 100 )
		return parseFloat(regexMatch).toFixed(1);
	
        // If >= 1000, no processing, just return value 
	return regexMatch;


}

//NEW Display type
function set_display_style(display_type, regexMatch, stateString) {

	switch (display_type)  {
	
	case "Bbraun" :
		return bbraun_disp_type(regexMatch, stateString );
		break;
	
	case "AlarisGP" :
		return alarisGP_disp_type(regexMatch);
		break;
	case "AlarisGH" :
		return alarisGH_disp_type(regexMatch);
	        break;

	default : //That is: do nothing
		return regexMatch;
	}


	
}


define(['./displayMappings', 'd3/d3'], function (mappings) {
    "use strict";
	var splitter = ":= ";
	var o = {};
	o.updateDisplay = function (stateString) {
		var map = mappings.active;
		if (stateString) {
			var key, regex, regexMatch, uiElement,display_type, stringToUse;
            _.each(map, function (value, key) {
                //get the value of the display field in the output
				regex = new RegExp(value.regex);
				regexMatch = regex.exec(stateString);
				if (regexMatch && regexMatch.length > 1) {
					regexMatch = eval(regexMatch[1].toString());

					// NEW: Display type, checking if d_type has been set, if not 'Classic' is default value 
					if( value.hasOwnProperty('d_type')) 
					    display_type = value.d_type.substring(value.d_type.indexOf('=') +1);
					else
					    display_type = "Classic";

					stringToUse = set_display_style(display_type, regexMatch, stateString );

					//update the display ui element with the value
					uiElement = value.uiElement;
					if (uiElement) {
						d3.select("#" + uiElement).html("")
							.append("span").attr("class", "displayvalue").html(stringToUse);
					}
				}
					
				uiElement = undefined;
            });
		}//endif
	};
	
	o.clearDisplay = function () {
		var key, uiElement;
        _.each(mappings, function (value, key) {
            uiElement = value.uiElement;
			if (uiElement) {
				d3.select("#" + uiElement).html("");
			}
			uiElement = undefined;
        });
	};
	return o;
});
