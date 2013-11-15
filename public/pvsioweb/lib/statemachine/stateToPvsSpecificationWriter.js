/**
 * 
 * @author Enrico D'Urso
 * @date 11/13/13 11:48:50 AM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, MouseEvent */



/**
     * @fileOverview Utility functions to translate from a graphic specification to a pvs specification.
     * @version 0.2
     */


/**
     * 
     * @module stateToPvsSpecificationWriter
 */


define(function (require, exports, module) {
	"use strict";

 
  /**************     State Variables                              ************************************************/

	var writer;
    var hashTableContentEditor;
    var drawer;
  /**************  Exported Functions Definition                    ************************************************/

/** 
 *  Create a new pvs specification   
 *
 *  @param nameTheory           - Name of the pvs theory which will be created    
 *  @param editor               - Reference to the editor where the pvs specification has to be written                    
 *
 *  @returns void 
 *	      
 */

function newPVSSpecification(nameTheory, editor)
{
	    writer = new writerOnContent(nameTheory, editor);
        drawer = require("../../lib/statemachine/stateMachine");
}

/** 
 *  Add a state in the specification  
 *
 *  @param newState             - Object having name and id property  
 *
 *  @returns void 
 *	      
 */
function addState(newState)
{
        var hasBeenStateAlreadyAdded = false;
        ///Get StateNames in String format: StateName: TYPE = {X0,X1...};
        var stateNamesString = writer.getStateNames();
        ///Build an array filled with the labels of the nodes: [X0,X1..]
        var stateNamesArray = stateNamesString.substring(stateNamesString.indexOf('{') + 1,stateNamesString.indexOf('}') )
                                              .split(',');
    
        /// Check If newState.name is already in stateNames (checking is made only if stateNamesArray is defined ) 
        if( stateNamesArray ){ hasBeenStateAlreadyAdded = itemIsContained(stateNamesArray, newState.name); }
    
        if( ! hasBeenStateAlreadyAdded ) { writer.addState(newState.name); }
        else                             { console.log("ERROR addState: Trying to add a state already added "); }

        noFocus();
}

/** 
 *  Remove a state in the specification  
 *
 *  @param stateToRemove       - Object having name and id property  
 *
 *  @returns void 
 *	      
 */
function removeState(stateToRemove, nodeCounter)
{
    console.log("RemoveState, stateToPVsSpecificationWriter.js", stateToRemove);    
    writer.removeState(stateToRemove.name, nodeCounter);
}

/** 
 *  Add a transition in the PVS Specification  
 *
 *  @param newTransition             - New transition function name  
 *
 *  @returns void 
 *	      
 */	
function addTransition(newTransition)
{
	writer.addTransition(newTransition );
	noFocus();       

}

/** 
 *  Add a condition for a transition function   
 *
 *  @param {string }   nameTransition    - Name of the transition has to be modified 
 *  @param source                        - source state for the condition is being added 
 *  @param target                        - target state for the condition is being added   
 *
 *  @returns void 
 *	      
 */
function addConditionInTransition(transitionName, source, target)
{
	writer.addConditionInTransition(transitionName, source.name, target.name );	
	//noFocus();
}

/** 
 *  This function should be called when user clicks on canvas,so the focus on previously selected element will be lost     
 *  @returns void 
 *	      
 */
function noFocus()
{
    if( ! writer )
        return;
    
	//writer.editor.gotoLine(0);
	if( writer.lastMarker )
	{
	    writer.editor.removeSelectionMarker(writer.lastMarker);
	    writer.lastMarker = undefined;
	}
}

/** 
 *  Called when user clicks on an edge, the corresponding code in the editor will be highlighted    
 *  @param {object} edge  - Object which represents the edge, it should be at least 'name' property
 *  @returns void 
 *	      
 */
function focusOnFun(edge)
{
     noFocus();

     var range = writer.editor.getSelectionRange();
     var objectSearch = { 
  		        	wholeWord: false,
			        range: null,
                        }; 

     var init = "%{\"_block\": \"BlockStart\" , \"_id\" : \"" + edge.name + "(st: (per_" + edge.name +"))\"}";
     var end = " %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + edge.name + "(st: (per_" + edge.name + "))\"}";
	
     var initSearch = writer.editor.find(init, objectSearch, true);
     var endSearch = writer.editor.find(end, objectSearch, true);
	
     
     range.start.row = initSearch.start.row;
     range.start.column = initSearch.start.column;
     range.end.row = endSearch.end.row;
     range.end.column = endSearch.end.column;

     objectSearch.range = range;
	
     init = "st`current_state = " + edge.source.name;
     end = "IN enter_into(" + edge.target.name + ")(new_st)";
     
     initSearch = writer.editor.find(init, objectSearch, true );
     endSearch = writer.editor.find(end, objectSearch, true ); 

     range.start.row = initSearch.start.row;
     range.start.column = initSearch.start.column;
     range.end.row = endSearch.end.row;
     range.end.column = endSearch.end.column;
     
     /// Saving range that is going to be highlighted
     writer.lastMarker = range;
  
     /// Highlighting text 
     writer.editor.addSelectionMarker(range);
	
}

/** 
 *  This function should be called when user clicks on an element (node). Its purpose is to highlight the corresponding code in the editor
 *  @param {object} node  - Node to be highlighted in the editor, it is an object having at least 'name' property        
 *  @returns void 
 *	      
 */
function focusOn(node)
{
	noFocus();
	var tmp = writer.editor.find("{" + node.name);

    if( ! tmp )
	    writer.editor.find("," + node.name);
}

/** 
 *  This function is called when the user changes the name of a node, we need to change the PVS specification to be consistent with new name of node
 *  @param {string} oldName  - old name of the node  
 *  @param {string} newName  - new name of the node        
 *  @returns void 
 *	      
 */
function changeStateName(oldName, newName)
{
	var objectSearch = { 
  			     wholeWord: true,
			     caseSensitive : true,
			     range: null,
		           }; 

	writer.editor.find(oldName, objectSearch);
	writer.editor.replaceAll(newName);
}
/** 
 *  This function is called when the user changes the name of an edge, we need to change the PVS specification to be consistent with new name of    
    the edge
 *  @param {string} oldName      - old name of the edge 
 *  @param {string} newName      - new name of the edge
 *  @param {string} sourceName   - name of the source node of the transition 
 *  @param {string} deleteName   - name of the target node of the transition 
 *  @param {integer} counter - number of the conditions inside the function (if one, we can delete it completely)
 *  @returns void 
 *	      
 */
function changeFunName(oldName, newName, sourceName, targetName, counter)
{
    
    if( counter > 1 )
    {   
        writer.deleteCondInTrans(oldName, sourceName, targetName);
        writer.addTransition(newName );
        writer.addConditionInTransition(newName, sourceName, targetName);
    }
    else 
    {
        writer.deleteTransition(oldName);   
    }
    
}

function undo()
{
    writer.editor.undo();       
}

function redo()
{
    writer.editor.redo();       
}
  /**************  Utility Functions private to the module    ******************************************************/    
    
//Pure utility function used to check if item is an element of array
function itemIsContained(array, item)
{
    var length = array.length;

    for( var i = 0; i < length; i++ )
    {
         if( array[i] === item )
             return true;
    }
    return false;

}
    
function writerOnContent(nameTheory, editor)
{
	this.nameTheory = nameTheory;
    this.defaultStateName = "  StateName: TYPE";
	this.delimitator = "";
	this.editor = editor;
    this.userIsModifying = 0;
    this.timeOut = undefined;
    this.cursorPosition;
    
	this.content = this.nameTheory + ": THEORY \n  BEGIN\n\n" +
		       "  %{\"_block\" : \"BlockStart\", \"_id\" : \"StateName\"  }\n" + 
	           "  StateName: TYPE\n" + 
		       "  %{\"_block\" : \"BlockEnd\", \"_id\" : \"StateName\"  }\n\n" +
		       "  %{\"_block\" : \"BlockStart\", \"_id\" : \"State\"}\n" +
		       "  State: TYPE = [#\n"+ 
                       "    current_state: StateName \n" +
                       "  #]\n" +
		       "  %{\"_block\" : \"BlockEnd\", \"_id\" : \"State\"]\n\n" +
		       "  %{ \"_block\" : \"BlockStart\", \"_id\" : \"initial_state\"}\n" +
	               "  initial_state: State \n" +
		       "  %{ \"_block\" : \"BlockEnd\", \"_id\" : \"initial_state\"}\n\n" +
                       " END " + this.nameTheory;    

	editor.setValue(this.content);
	editor.clearSelection();
	editor.moveCursorTo(0,0);
	
	editor.content = undefined; 

    /********* Functions about Editor changing (Note: I need to define them here ********/
    
    this.handleUserModificationOnEditor = function()
    {
        console.log("USER MODIFICATION"); 
        clearTimeout(writer.timeOut);
        writer.timeOut = setTimeout(function(){writer.parseToFindDiagramSpecificationInconsistency() } , 1000 );
        
    }
    this.parseToFindDiagramSpecificationInconsistency = function()
    { 
        writer.saveCursorPosition();
        
        document.getElementById("warningDebug").value = "\tDEBUG: \n";
        var nodesInDiagram = drawer.getNodesInDiagram(); 
        var stateNamesInSpecification = writer.getStateNames();
        var edgesInDiagram = drawer.getEdgesInDiagram();
        
        /****************** Checking stateNames **************/

        writer.checkConsistenceStateNames(nodesInDiagram, stateNamesInSpecification);      
        
        /****************** Checking transFunctions **********/
        
        if( edgesInDiagram.length )
            writer.checkConsistenceTransFunction(edgesInDiagram);
        /******************************************************/
        
        editor.find(''); // This is an hack to make disappear selection created indirectly to find content
        
        writer.restoreCursorPosition();
        
    }
    this.checkConsistenceStateNames = function(nodesInDiagram, stateNamesInSpecification)
    {
        var debug = document.getElementById("warningDebug");
        var nodesInStateNames;
        var listEmpty = false;
        var numberOfStatesInDiagram;
        //First: Check if the list is empty
        if( stateNamesInSpecification.indexOf('=') == -1 )
            listEmpty = true;
        
        if( listEmpty && nodesInDiagram.length != 0 )
            alert("Error: stateNames");
        
        // Basically, we are getting just the name of the states and putting them in an array using split
        // Example: StateName: TYPE = {X0,X1};  ---> [X0, X1] 
        nodesInStateNames = stateNamesInSpecification.substring(stateNamesInSpecification.indexOf('{') + 1,                                                                                 stateNamesInSpecification.indexOf('}') ).split(',');
        
        numberOfStatesInDiagram = nodesInDiagram.length;
        
        for( var i = 0; i < numberOfStatesInDiagram; i++ )
        { 
            var isContained = itemIsContained(nodesInStateNames, nodesInDiagram[i].name );  
            if( ! isContained ) 
            {   
                console.log("Error: ", nodesInDiagram[i].name, "Is not Contatined in ", nodesInStateNames);
                nodesInDiagram[i].warning.notPresentInSpec = true;
                debug.value = debug.value + "Error: " + nodesInDiagram[i].name + " is not contained in the specification\n";
            }
            else 
            {
                nodesInDiagram[i].warning.notPresentInSpec = false;   
            }
        }
        
        console.log("ConsistenceStateNames finished ");
        
    }
    this.checkConsistenceTransFunction = function (edgesInDiagram)
    {
           var debug = document.getElementById("warningDebug");
        
           var length = edgesInDiagram.length;
           for( var i = 0; i<length; i++)
           {
                var currentEdge = edgesInDiagram[i];
                var currentName = currentEdge.name;
                var currentSource = currentEdge.source.name;
                var currentTarget = currentEdge.target.name;
                
                /* Checking if the function is defined; example: looking for  tick(st:(per_tick )):State = */
                var isFunctionPresent = writer.editor.find(currentName + "(st:(per_" + currentName + " )):State =");
                if( isFunctionPresent === undefined )
                {
                    console.log(currentName + " is not defined " );
                    debug.value = debug.value + currentName + "is not defined or is badly defined";
                    return;                    
                }
                var currentCondBlock = writer.buildTagCond(currentName, currentSource, currentTarget);
                var content = writer.getContentBetweenTags(currentCondBlock[0], currentCondBlock[1]);
               
                if( content === undefined )
                {
                    debug.value = debug.value + "Impossible to check " + currentName + " " + currentSource + " " + currentTarget + "\n";
                    continue;
                }
                // CurrentState should be the current state, example: st`current_state = X0 --> X0
                var currentState = content.substring(content.indexOf('=') +1, content.indexOf('->') -1 );
                // Just cleaning the string from white space and \n
                currentState = currentState.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"");
                if( currentState !== currentSource )
                {
                    console.log("currentState is wrong in " + currentName + " function " );
                    debug.value = debug.value + " error in st`current_state in " + currentName + " function\n " ;
                }
               
                var currentCond = content.substring(content.indexOf("new_st"), content.indexOf("(new_st)") + 8).
                                          replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"");
      
               
                if( currentCond !== "new_st=leave_state(" + currentSource + ")" + "INenter_into(" + currentTarget +
                                    ")(new_st)")
                {
                    console.log("Error in condition in function " + currentName );
                    debug.value = debug.value + " error in condition, it should be : " + 
                                  "new_st=leave_state(" + currentSource + ")" + "IN enter_into(" + currentTarget +
                                    ")(new_st)";
                }             
                
                
           }
        
        
    }
    this.changeEditor = function() 
    {   
        if( writer.userIsModifying ) { writer.handleUserModificationOnEditor(); }
        else                         { console.log("Writer has modified editor content"); }
    }

    /********* End Functions a$bout Editor ************************************************/
    
    editor.getSession().on('change', this.changeEditor );    
    this.userIsModifying = 1;

	
	/********** END Constructor ********/	

    this.getLockOnEditor = function()
    {
        this.userIsModifying = 0;    
    }
    this.leaveLockOnEditor = function()
    {
        this.userIsModifying = 1;   
    }
    this.saveCursorPosition = function()
    {
        this.cursorPosition = this.editor.getCursorPosition();
    }
    this.restoreCursorPosition = function()
    {
        this.editor.moveCursorToPosition(this.cursorPosition);   
    }
    this.getContentBetweenTags = function(startTag, endTag)
    {
        var range = editor.getSelectionRange();
		var objectSearch = { 
                                wholeWord: false,
				                range: null,
			               }; 


		var initSearch = editor.find(startTag, objectSearch, true);
		var endSearch  = editor.find(endTag, objectSearch, true);
		var content;	

        if( initSearch === undefined || endSearch === undefined )
            return undefined;
        
		range.start.column = 0;
		range.end.column= 11111; ///FIXME
		range.start.row = initSearch.end.row ;
		range.end.row = endSearch.end.row - 1;
		
		//Content should be the list of the states
		content = editor.session.getTextRange(range); 
        
        return content;
        
    }
	this.addState = function( newState )
	{  
        this.getLockOnEditor();
        
		var range = editor.getSelectionRange();
		var objectSearch = { 
  				     wholeWord: false,
				     range: null,
			           }; 

		var init = "%{\"_block\" : \"BlockStart\", \"_id\" : \"StateName\"  }";
		var end = "%{\"_block\" : \"BlockEnd\", \"_id\" : \"StateName\"  }";

		var initSearch = editor.find(init, objectSearch, true);
		var endSearch  = editor.find(end, objectSearch, true);
		var content;	

		range.start.column = 0;
		range.end.column= 11111; ///FIXME
		range.start.row = initSearch.end.row + 1;
		range.end.row = endSearch.end.row - 1;
		
		//Content should be the list of the states
		content = editor.session.getTextRange(range); 

		var index;
        var symbol_beg = "";
		var newStateString;

		///Checking if a state has been already added 
		index = content.indexOf('}');
		if( index == -1 ) ///If not, add also the '{' at the beginning 
		{
		    symbol_beg = " = {";
		    index = content.indexOf('E') + 1;
	    }
		
		newStateString = content.substring(0, index);
		newStateString = newStateString + symbol_beg + this.delimitator + newState + '};';
		this.delimitator = ',';
		
		editor.find(content);
		editor.replace(newStateString);
        
        this.leaveLockOnEditor();


	} 
        
    this.removeState = function( stateToRemove, stateCounter )
    {
            this.getLockOnEditor();
        
            //First we need to remove state from StateNames                 
            var content = this.getStateNames();
            var newContent;
            
            //Processing situation  in which there are no states 
            editor.find(content);
            if( stateCounter === 0 )
            {
                editor.replace(this.defaultStateName);
                return;    
            }
            newContent = content.replace(stateToRemove, " ");
            newContent = newContent.replace(" ,", "").replace(", ,","").replace(", ","");
            editor.replace(newContent);    
            //FIXME: ADD delete Node in function
            
            this.leaveLockOnEditor();
        
    }
	
	this.addTransition = function (newTransition)
	{
        this.getLockOnEditor();
        
		var range = editor.getSelectionRange();
		var objectSearch = { 
  				     wholeWord: false,
				     range: null,
			           }; 

		//Before adding a Transition, we need to check if it has been already created
	
		var checkingString = "%{\"_block\": \"BlockStart\" , \"_id\" : \"" + newTransition + "(st: (per_" + newTransition + "))\"}\n";
		var checkingSearch = editor.find(checkingString, objectSearch, true);

		if( checkingSearch ) //If initial Tag is present, transition has been already created 
		    return;

		//Transition function has not been already created
		var end = "END " + this.nameTheory;

		var endSearch = editor.find(end, objectSearch, true);
		var content;	
	
		range.start.column = 0;
		range.end.column= 11111; ///FIXME
		range.start.row = endSearch.end.row - 1;
		range.end.row = endSearch.end.row - 1;
 
		editor.gotoLine(endSearch.end.row , 1000, true);
		content = "  %{\"_block\": \"BlockStart\" , \"_id\" : \"per_" + newTransition + "(st:State)\"}\n" + 
		          "  per_" + newTransition + "(st:State ) : bool = true\n" +
                          "  %{\"_block\": \"BlockEnd\" , \"_id\" : \"per_" + newTransition + "(st:State)\"}\n\n";  
	
		content = content + 
			  "  %{\"_block\": \"BlockStart\" , \"_id\" : \"" + newTransition + "(st: (per_" + newTransition + "))\"}\n" +
			  "  " + newTransition + "(st:(per_" + newTransition + " )):State = \n" +
			  "  COND\n" +
			  "  ENDCOND\n" +
			  "  %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + newTransition + "(st: (per_" + newTransition + "))\"}\n\n"; 
			  
			
		editor.insert("\n" + content);
        
        this.leaveLockOnEditor();
	}
	this.buildTagCond = function(nameTransition, sourceName, targetName)
    {
           var tagCondArray = new Array();
        
           tagCondArray.push("\n  %{\"_block\": \"CondStart\", \"_id\" : \"tick(st: (per_tick))\", \"_source\" : " + sourceName + ", \"_target\" : " 
                      + targetName + "}\n");
        
           tagCondArray.push("\n  %{\"_block\": \"CondEnd\", \"_id\" : \"tick(st: (per_tick))\", \"_source\" : " + sourceName + ", \"_target\" : " 
                      + targetName + "}");
        
           return tagCondArray;
        
        
    }
	this.addConditionInTransition = function(nameTransition, sourceName, targetName )
	{
        this.getLockOnEditor();
        
	    var condTag = this.buildTagCond(nameTransition, sourceName, targetName);
        
        // FIXME: Create a function that returns this string passing nameTransition as parameter 
		var firstLine = "  %{\"_block\": \"BlockStart\" , \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition + "))\"}\n" +
			        "  " + nameTransition + "(st:(" + nameTransition + " )):State = \n" ;

		var endLine = "  %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition + "))\"}\n\n";
		
		var objectSearch = { 
  				     wholeWord: false,
				     range: null,
			           }; 
		var endSearch = editor.find(endLine, objectSearch, true);
	
		//Attention to , (coma)!!! FIXME
		editor.gotoLine(endSearch.end.row -3 , 1000, true);
        
        editor.insert(condTag[0]);
        
		editor.insert("     st`current_state = "  + sourceName + "\n    -> LET new_st = leave_state("+sourceName +")" +
                              "\n        IN enter_into("+ targetName + ")(new_st)");
        
        editor.insert(condTag[1]);
        
        //We can use editor.find to highlight some text lines
        
       // var a = editor.find("     st`current_state = "  + sourceName + "\n    -> LET new_st = leave_state(" + sourceName + ")" +
                            //  "\n        IN enter_into("+ targetName + ")(new_st)");
        
        var edge = new Object();
        edge.source = new Object();
        edge.target = new Object();
        edge.source.name = sourceName;
        edge.target.name = targetName;
        edge.name = nameTransition;
        
		focusOnFun(edge);
        
        this.leaveLockOnEditor();
	
	}
      
    this.deleteCondInTrans = function(oldName, sourceName, targetName)
    { 
       console.log("deleteCondInTrans");
    }
    this.deleteTransition = function(oldName) 
    {
        console.log("deleteTrans");
    }
    this.getStateNames = function()
    {
        var range = editor.getSelectionRange();
		var objectSearch = { 
  				             wholeWord: false,
				             range: null,
			               }; 

        var init = "%{\"_block\" : \"BlockStart\", \"_id\" : \"StateName\"  }";
		var end  = "%{\"_block\" : \"BlockEnd\", \"_id\" : \"StateName\"  }";

		var initSearch = editor.find(init, objectSearch, true);
		var endSearch = editor.find(end, objectSearch, true);
		var content;	

		range.start.column = 0;
		range.end.column= 11111; ///FIXME
		range.start.row = initSearch.end.row + 1;
		range.end.row = endSearch.end.row - 1;
		
		//Content should be the list of the states
		content = editor.session.getTextRange(range); 

        noFocus();
        return content;
        
        }
}

function keepTrackEditorContentHashTable()
{
    this.nodes = {};
    this.nodeLength = 0;
    this.functions = {};
    this.functionLength = 0;
            
    this.addState = function(nodeId, nodeName)
    {
         if( this.nodes.hasOwnProperty(nodeId) )
             return false;
         
         this.nodes[nodeId] = nodeName;
         this.nodeLength ++;
            
         return this.nodeLength;     
    }
        
    this.removeState = function(nodeId)
    {
         if( ! this.nodes.hasOwnProperty(nodeId) )
             return false;
          
         delete this.nodes[nodeId];
         this.nodeLength --;
    
         return this.nodeLength; 
    
    }
    this.getAllNodes = function()
    {
        var nodesName = new Array();
        for( var id in this.nodes)
        {
             console.log(id, this.nodes[id]);
             nodesName.push(this.nodes[id]);
             
        }
        return nodesName;
        
    }
    

}
    
     /*************    Exported Function               ************************************************/


    module.exports = {
        newPVSSpecification : newPVSSpecification,
        addState : addState,
        removeState : removeState,
		addTransition : addTransition,
		addConditionInTransition : addConditionInTransition,
		noFocus : noFocus,
		focusOn : focusOn,
		focusOnFun : focusOnFun,
		changeStateName : changeStateName,
        changeFunName : changeFunName, 
        undo : undo,
        redo : redo,
        click : noFocus
	               /*addEntryCondition : addEntryCondition,
		       setInitialState   : setInitialState,
		       userModification  : userModification,
	               addConditionInTransition : addConditionInTransition*/	

   };




});
