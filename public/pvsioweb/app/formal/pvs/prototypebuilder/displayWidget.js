/**
 * 
 * @author Patrick Oladimeji
 * @date Dec 29, 2012 : 1:24:55 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, es5: true */
/*global define, d3, require, __dirname, process, _*/
define(['./baseWidget', './widgetType', 'util/property', './displayMappings', './displayType'],
	function (baseWidget, widgetType, property, displayMappings, displayType) {
        "use strict";
        var widgetTypes = [{value: widgetType.Button, label: widgetType.Button},
                           {value: widgetType.Display, label: widgetType.Display}];

	var displayTypes = [{ value: displayType.Classic   ,  label: displayType.Classic   } ,
			    { value: displayType.TCAS      ,  label: displayType.TCAS    } ,
			   ];
    
        function predefinedRegexes() {
            var res = [];
            _.each(displayMappings.preset, function (value) {
                res.push(value);
            });
            return res;
        }
        
        return function (regex, label) {
            var o = baseWidget(widgetType.Display);
            o.regex = property.call(o, regex || '');
            //o.label = property.call(o, label || '');
            o.predefinedRegex = property.call(o, "");
            o.prefix = property.call(o, "");
            o.d_type = property.call(o,"Classic");
            o.toJSON = function () {
                return {
                    predefinedRegex: o.predefinedRegex(),
                    regex: o.regex(),
                    prefix: o.prefix(),
                    type: o.type(),
	            d_type: o.d_type()
                };
            };
            
            o.getRenderData = function () {
                var res = [];
                res.push({label: "Area Type", element: "select", value: o.type(), data: widgetTypes, name: 'type'});
                res.push({label: "Value Type", element: "select", value: o.predefinedRegex(), data: predefinedRegexes(),
                          name: "predefinedRegex", other: ['required']});
		res.push({label: "Display Type", element: "select", value: o.d_type(), data: displayTypes, name: 'd_type'});
                res.push({label: "Area Identifier", element: "input", inputType: "text", value: o.prefix(), name: "prefix", other: ['required']});
                res.push({label: "Regex", element: "input", inputType: "text", value: o.regex(), name: 'regex', other: ['required']});
                //res.push({label:"Label", element:"input", inputType:"text", value:o.label(), name:"label"});
                return res;
            };
            return o;
        };
	});
