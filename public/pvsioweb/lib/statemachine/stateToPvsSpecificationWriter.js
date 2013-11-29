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
    var listView;
    var currentProject;
    var ws;
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

function newPVSSpecification(nameTheory, editor, wsocket, curProj, pm)
{
	    writer = new WriterOnContent(nameTheory, editor);
        drawer = require("../../lib/statemachine/stateMachine");
        listView = require("pvsioweb/ListView");
        var fileHandlerEmulink = require("pvsioweb/../emulink/fileHandler/fileHandler");
        ws = wsocket;
        
        currentProject = curProj;
        fileHandlerEmulink.new_file(currentProject, editor, ws, nameTheory, editor.getValue(), pm);
        
        hideTags();
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
        noFocus();
        writer.getLockOnEditor();
    
        var hasBeenStateAlreadyAdded = false;
        ///Get StateNames in String format: StateName: TYPE = {X0,X1...};
        var stateNamesString = writer.getStateNames();
        ///Building an array filled with the labels of the nodes: [X0,X1..]
        var stateNamesArray = stateNamesString.substring(stateNamesString.indexOf('{') + 1, stateNamesString.indexOf('}'))
                                              .split(',');
    
        /// Check If newState.name is already in stateNames (checking is made only if stateNamesArray is defined ) 
        if( stateNamesArray){ hasBeenStateAlreadyAdded = itemIsContained(stateNamesArray, newState.name); }
    
        if( !hasBeenStateAlreadyAdded) { writer.addState(newState.name); }
        else                             { console.log("ERROR addState: Trying to add a state already added "); }

        if( ! writer.tagsHaveToBeShowed )
            hideTags();
    
        writer.leaveLockOnEditor();
}
 
/** 
 *  Add field in PVS state  
 *
 *  @param {string} nameField   - Name of the new field
 *  @param {string} typeName    - Type of the new field
 *
 *  @returns void 
 *	      
 */
function addFieldInState(nameField, typeName)
{
    noFocus();
    writer.saveCursorPosition();
    writer.getLockOnEditor();
    
    writer.addFieldInState(nameField, typeName);
    
    if( ! writer.tagsHaveToBeShowed )
        hideTags();
    
    writer.leaveLockOnEditor();
    writer.restoreCursorPosition();
    
}
/** 
 *  Add operation to do in a condition  
 *
 *  @param {string} nameTrans     - Name of the transition which contains the condition
 *  @param {string} sourceName    - Name of the source node in the condition
 *  @param {string} targetName    - Name of the target node in the condition
 *  @param {string} operation     - Operation is to be added 
 *  @returns void 
 *	      
 */  
function addOperationInCondition(nameTrans, sourceName, targetName, operation)
{
    noFocus();
    writer.getLockOnEditor();
    
    writer.addOperationInCondition(nameTrans, sourceName, targetName, operation);
    
    if( ! writer.tagsHaveToBeShowed )
        hideTags();
    
    writer.leaveLockOnEditor();    
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
    writer.getLockOnEditor();
    writer.removeState(stateToRemove.name, nodeCounter);
    writer.leaveLockOnEditor();
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
    writer.getLockOnEditor();
    
	writer.addTransition(newTransition );
    if( ! writer.tagsHaveToBeShowed )
        hideTags();
	noFocus();  
    
    writer.leaveLockOnEditor();

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
    writer.getLockOnEditor();
    
	writer.addConditionInTransition(transitionName, source.name, target.name);	
    if( ! writer.tagsHaveToBeShowed )
        hideTags();
	//noFocus();
    
    writer.leaveLockOnEditor();
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
 *  @param {bool} [clickedOn] - If true, user has just clicked on the edge
 *  @returns void 
 *	      
 */
function focusOnFun(edge, clickedOn)
{
     noFocus();
    
     var rangeFold = writer.editor.getSelectionRange();    
     var range = writer.editor.getSelectionRange();
     /***********************/
     
     var realNameEdge = edge.name.indexOf('{') == -1 ? edge.name : edge.name.substring(0, edge.name.indexOf('{'));
     var arrayTag = writer.buildTagCond(realNameEdge, edge.source.name, edge.target.name );
    
     if( writer.tagsHaveToBeShowed )
         clickedOn = false;
    //FIXME: delete clickedOn
    clickedOn = false;
    
     if( clickedOn)
     {   
         var folds = writer.editor.session.getAllFolds();
         
         for( var i = 0; i < folds.length; i++)
         {
              rangeFold.start.row = folds[i].start.row ;
              rangeFold.end.row = folds[i].end.row;
              rangeFold.start.column = folds[i].start.column;
              rangeFold.end.column = folds[i].end.column;
              var content = writer.editor.session.getTextRange(rangeFold);
             
              if( content.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"") === arrayTag[0].replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"") )
              {
                  range.start.row = folds[i].end.row +1;
                  range.start.column = 0;
              }
              if( content.replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"") === arrayTag[1].replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"") )
              {
                  range.end.row = folds[i].start.row ;
                  range.end.column = 100;
              }
         }
     }
     else
     {
     
         var objectSearch = { 
  		        	wholeWord: false,
                    wrap : true,
			        range: null
                        }; 

         var initSearch = writer.editor.find(arrayTag[0].replace(/(\r\n|\n|\r)/gm,""), objectSearch);
         var endSearch = writer.editor.find(arrayTag[1].replace(/(\r\n|\n|\r)/gm,""), objectSearch);

         range.start.row = initSearch.start.row + 1;
         range.start.column = 0;
         range.end.column = 100;
         range.end.row = endSearch.start.row - 1;
     }
     
     
     /// Saving range that is going to be highlighted
     writer.lastMarker = range;
  
     /// Highlighting text 
     writer.editor.addSelectionMarker(range);
    
     restoreTags();
        
	
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
        
    var objectSearch = { 
  			     wholeWord: false,
			     caseSensitive : true,
			     range: null
		      }; 
    
    var range =  writer.editor.getSelectionRange();
	var tmp = writer.editor.find("{" + node.name, objectSearch);

    if( ! tmp )
	    tmp = writer.editor.find("," + node.name, objectSearch);
    
     range.start.row = tmp.start.row ;
     range.start.column = tmp.start.column + 1;
     range.end.column = tmp.end.column ;
     range.end.row = tmp.end.row  ;
     
     
     /// Saving range that is going to be highlighted
     writer.lastMarker = range;
  
     /// Highlighting text 
     writer.editor.addSelectionMarker(range);
        
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
    writer.getLockOnEditor();
    
	var objectSearch = { 
  			     wholeWord: true,
			     caseSensitive : true,
			     range: null
		           }; 

	writer.editor.find(oldName, objectSearch);
	writer.editor.replaceAll(newName);
    
    writer.leaveLockOnEditor();
}
/** 
 *  This function is called when the user changes the name of an edge, we need to change the PVS specification to be consistent with new name of    
    the edge
 *  @param {string} oldName      - old name of the edge 
 *  @param {string} newName      - new name of the edge
 *  @param {string} sourceName   - name of the source node of the transition 
 *  @param {string} deleteName   - name of the target node of the transition 
 *  @param {integer} counter     - number of the conditions inside the function (if one, we can delete it completely)
 *  @returns void 
 *	      
 */
function changeFunName(oldName, newName, sourceName, targetName, counter)
{
    // If counter > 1 there are other conditions in the trans. function so we cannot delete it
    // We just need to move the condition in a new trans. function 
    
    writer.getLockOnEditor();
    
    if( counter > 1 )
    {   
        writer.deleteCondInTrans(oldName, sourceName, targetName); // Delete transition 
    }
    else 
    {
        writer.deleteTransition(oldName);  // Just delete condition  
    }
    
    writer.addTransition(newName ); // Create a new transition (if already present it will be not created)
    writer.addConditionInTransition(newName, sourceName, targetName); // Add condition 
    
    restoreTags();
    
    writer.leaveLockOnEditor();
    
    

}
    
function restoreTags()
{
     if( ! writer.tagsHaveToBeShowed )
         writer.timeOutTag = setTimeout(function(){ hideTags(); }, 10 ); 
}
        
function hideTags()
{   
    writer.editor.find("");
    var Range = require("ace/range").Range;
    var lengthDocument = writer.editor.session.getLength();
    var objectSearch = { 
                        needle: "%{\"_block\"",
                        wholeWord: false,
                        range : new Range(0, 0, lengthDocument, 1000)
				        
			           };
    var currentTag = writer.editor.find(objectSearch);
    while( currentTag != undefined )
    {
        writer.editor.session.addFold("", new Range(currentTag.start.row, currentTag.start.column, currentTag.end.row, 100));
        objectSearch.range =  new Range(currentTag.start.row +1, 0, lengthDocument, 100)
        currentTag = writer.editor.find(objectSearch);
    }
    objectSearch = { 
                        needle: "\n  %{\"_block\"",
                        wholeWord: false,
                        range : new Range(0, 0, lengthDocument, 1000)
				        
			           };
    currentTag = writer.editor.find(objectSearch);
    while( currentTag != undefined )
    {
        writer.editor.session.addFold("", new Range(currentTag.start.row, currentTag.start.column, currentTag.end.row, 100));
        objectSearch.range =  new Range(currentTag.start.row +1, 0, lengthDocument, 100)
        currentTag = writer.editor.find(objectSearch);
    }
    
    writer.tagsHaveToBeShowed = false;
}
    
function showTags()
{
    var folds = writer.editor.session.getAllFolds();
    writer.editor.session.removeFolds(folds);
    writer.tagsHaveToBeShowed = true;
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
    
function WriterOnContent(nameTheory, editor)
{
	this.nameTheory = nameTheory;
    this.defaultStateName = "  StateName: TYPE";
	this.delimitator = "";
	this.editor = editor;
    this.userIsModifying = 0;
    this.timeOut = undefined;
    this.timeOutTags = undefined;
    this.cursorPosition;
    this.tagsHaveToBeShowed = false;
    
	this.content = this.nameTheory + ": THEORY \n  BEGIN\n\n" +
		       "  %{\"_block\" : \"BlockStart\", \"_id\" : \"StateName\"  }\n" + 
	           "  StateName: TYPE\n" + 
		       "  %{\"_block\" : \"BlockEnd\", \"_id\" : \"StateName\"  }\n\n" +
		       "  %{\"_block\" : \"BlockStart\", \"_id\" : \"State\"}\n" +
		       "  State: TYPE = [#\n"+ 
                       "    current_state: StateName, \n" +
                       "    previous_state: StateName \n" +
                       "  #]\n" +
		       "  %{\"_block\" : \"BlockEnd\", \"_id\" : \"State\"}\n\n" +
		       "  %{\"_block\" : \"BlockStart\", \"_id\" : \"initial_state\"}\n" +
	               "  initial_state: State \n" +
		       "  %{\"_block\" : \"BlockEnd\", \"_id\" : \"initial_state\"}\n\n" +
               "  leave_state(s: StateName)(st: State): State = st WITH [ previous_state := s ] \n\n" +
               "  enter_into(s: StateName)(st:State): State = st WITH [ current_state := s ] \n\n" +
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
        
        hideTags();
        
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
                var currentName = currentEdge.name.indexOf('{') == -1 ? currentEdge.name 
                                                                      : currentEdge.name.substring(0, currentEdge.name.indexOf('{'));
                var operation = currentEdge.name.substring(currentEdge.name.indexOf('{') +1, currentEdge.name.indexOf('}'));
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
      
               
               /* FIXME:
                if( currentCond !== "new_st=leave_state(" + currentSource + ")(st)" + "INenter_into(" + currentTarget +
                                    ")(new_st)")
                {
                    console.log("Error in condition in function " + currentName );
                    debug.value = debug.value + " error in condition, it should be : " + 
                                  "new_st=leave_state(" + currentSource + ")(st)" + "IN enter_into(" + currentTarget +
                                    ")(new_st)";
                }         
                */
                
                
           }
        
        
    }
    this.checkConsistenceOperation = function(operation)
    {
        var indexEqual;
        
        if( (indexEqual = operation.indexOf('=')) == -1 )
            return;
        
        var missField = true;
        var fieldStateInOperation = operation.substring(0, indexEqual).replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"");
        var startTag = "%{\"_block\" : \"BlockStart\", \"_id\" : \"State\"}";
        var endTag = "%{\"_block\" : \"BlockEnd\", \"_id\" : \"State\"}";
        
        var currentFieldsState = this.getContentBetweenTags(startTag, endTag).replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"");
        currentFieldsState = currentFieldsState.substring(currentFieldsState.indexOf('#') + 1, currentFieldsState.lastIndexOf('#') );
        currentFieldsState = currentFieldsState.split(',');
        var length = currentFieldsState.length;
        
        for( var i = 0; i < length; i++ )
        {
             currentFieldsState[i] = currentFieldsState[i].substring(0, currentFieldsState[i].indexOf(':'));
             console.log(currentFieldsState[i],fieldStateInOperation);
             if( currentFieldsState[i] == fieldStateInOperation )
             {
                 missField = false;
                 break;
             }            
        }
        if( ! missField)
            return;
        
        var debug = document.getElementById("warningDebug");
        debug.value = "\t   DeBuG \n";
        debug.value = debug.value + "Warning: " + fieldStateInOperation + " is not in PVS State ";

    }
    this.changeEditor = function() 
    {   
        //Save the content file
        currentProject.pvsFiles()[0].content(writer.editor.getValue()).dirty(true);
        
        if( writer.userIsModifying ) { writer.handleUserModificationOnEditor(); }
        else                         { console.log("Writer has modified editor content"); }
    }
    
    editor.getSession().on('change', this.changeEditor );    
    this.userIsModifying = 1;

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
        console.log("CURSOR POSITION IS " +  this.cursorPosition.row);
    }
    this.restoreCursorPosition = function()
    {
        this.editor.moveCursorToPosition(this.cursorPosition);   
    }
    this.getContentBetweenTags = function(startTag, endTag)
    {
        var range = editor.getSelectionRange();
		var objectSearch = {    
                                wrap: true,
                                wholeWord: false,
				                range: null
			               }; 

        startTag = startTag.replace(/(\r\n|\n|\r)/gm,"");
        endTag = endTag.replace(/(\r\n|\n|\r)/gm,"");
        
		var initSearch = editor.find(startTag, objectSearch, true);
		var endSearch  = editor.find(endTag, objectSearch, true);
		var content;	

        if( initSearch === undefined || endSearch === undefined )
            return undefined;
        
		range.start.column = 0;
		range.end.column= 11111; ///FIXME
		range.start.row = initSearch.start.row +1 ;
		range.end.row = endSearch.start.row -1;
		
		content = editor.session.getTextRange(range); 
        
        return content;
        
    }
    this.addOperationInCondition = function(nameTrans, sourceName, targetName, operation)
    {
        this.checkConsistenceOperation(operation);
        
        operation = "   new_st = new_st WITH [ " + operation + " ]";
        var arrayTag = this.buildTagCond(nameTrans, sourceName, targetName);
        var content = this.getContentBetweenTags(arrayTag[0], arrayTag[1]);
        var newContent = content.substring(0, content.indexOf('IN') - 9) + "," + "\n    " + operation + "\n    " +
                         "  IN " +content.substring(content.indexOf("IN") + 2);
        
        this.editor.find(arrayTag[0] + content + arrayTag[1]);
        this.editor.replace(arrayTag[0] + newContent + arrayTag[1]);
        
    }
    this.addFieldInState = function(nameField, typeName)
    {
        var startTag = "%{\"_block\" : \"BlockStart\", \"_id\" : \"State\"}";
        var endTag = "%{\"_block\" : \"BlockEnd\", \"_id\" : \"State\"}";
        
        var oldContent = this.getContentBetweenTags(startTag, endTag);
        /// Getting just name and type 
        var content = oldContent.substring(oldContent.indexOf('#') + 1, oldContent.lastIndexOf('#') );
        
        var arrayFields = content.split(',');
        /// Inserting new values
        arrayFields.push(nameField + ': ' + typeName);
        
        var newContent ="  State: TYPE = [#\n";
        var length = arrayFields.length ;
        for( var i = 0; i < length ; i ++)
        {
             var comma = (i == (length - 1 )) ? "\n" : ",\n" ;
             newContent = newContent + "     "  +  arrayFields[i].replace(/(\r\n|\n|\r)/gm,"").replace(/\s+/g,"")  +  comma ;
        }   
        newContent = newContent + "  #]";
        
        
        this.editor.find(oldContent);
        this.editor.replace(newContent);
    }
	this.addState = function( newState )
	{          
		var range = editor.getSelectionRange();
		var objectSearch = { 
  				     wholeWord: false,
				     range: null
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
        
        var tmp = new Object();
        tmp.name = newState;
        focusOn(tmp);
        


	} 
        
    this.removeState = function(stateToRemove, stateCounter )
    {        
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
                    
    }
	
	this.addTransition = function (newTransition)
	{        
		var range = editor.getSelectionRange();
        
        var objectSearch = { 
  				              wholeWord: false,
                              wrap:true,
				              range: null
			               }; 
        
		//Before adding a Transition, we need to check if it has been already created	
		var checkingString = "(st:(per_" + newTransition + " ))";
		var checkingSearch = editor.find(checkingString, objectSearch);

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
        
		content = "\n  %{\"_block\": \"BlockStart\" , \"_id\" : \"per_" + newTransition + "(st:State)\"}\n" + 
		          "  per_" + newTransition + "(st:State ) : bool = true\n" +
                          "  %{\"_block\": \"BlockEnd\" , \"_id\" : \"per_" + newTransition + "(st:State)\"}\n\n";  
	
		content = content + 
			  "  %{\"_block\": \"BlockStart\" , \"_id\" : \"" + newTransition + "(st: (per_" + newTransition + "))\"}\n" +
			  "  " + newTransition + "(st:(per_" + newTransition + " )):State = \n" +
			  "  COND\n" +
			  "  ENDCOND\n" +
			  "  %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + newTransition + "(st: (per_" + newTransition + "))\"}\n\n"; 			  
			
		editor.insert("\n" + content + "\n");
        
	}
	this.buildTagCond = function(nameTransition, sourceName, targetName)
    {
           var tagCondArray = new Array();
        
           tagCondArray.push("\n  %{\"_block\": \"CondStart\", \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition +"))\", \"_source\" : " + sourceName + ", \"_target\" : " 
                      + targetName + "}\n");
        
           tagCondArray.push("\n  %{\"_block\": \"CondEnd\", \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition +"))\", \"_source\" : " + sourceName + ", \"_target\" : " 
                      + targetName + "}");
        
           return tagCondArray;
        
        
    }
	this.addConditionInTransition = function(nameTransition, sourceName, targetName )
	{        
	    var condTag = this.buildTagCond(nameTransition, sourceName, targetName);
        var firstTag = "  %{\"_block\": \"BlockStart\" , \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition + "))\"}\n";
        var secondTag ="  %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + nameTransition + "(st: (per_" + nameTransition + "))\"}\n";
		var oldContent = this.getContentBetweenTags(firstTag, secondTag );
        var comma ;
        if( oldContent.indexOf('%') == -1 )
            comma = '';
        else
            comma = ',';
        
		var objectSearch = { 
  				     wholeWord: false,
				     range: null
			           }; 
		var endSearch = editor.find(oldContent, objectSearch, true);
	
		editor.gotoLine(endSearch.start.row +2  , 1000, true);
        
        editor.insert(condTag[0]);
        
		editor.insert("     st`current_state = "  + sourceName + "\n    -> LET new_st = leave_state("+sourceName +")(st)" +
                              "\n        IN enter_into("+ targetName + ")(new_st)" + comma);
        
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
        	
	}

    this.buildTagFunction = function(transName)
    {
        var arrayTagFunc = new Array();
        
        arrayTagFunc.push("  %{\"_block\": \"BlockStart\" , \"_id\" : \"" + transName + "(st: (per_" + transName + "))\"}");
        arrayTagFunc.push("  %{\"_block\": \"BlockEnd\" , \"_id\" : \"" + transName + "(st: (per_" + transName + "))\"}");
        
        return arrayTagFunc;           
    }
    this.buildTagPerFunction = function(transName)
    {
        var arrayTagPerFun = new Array();
        
        arrayTagPerFun.push("  %{\"_block\": \"BlockStart\" , \"_id\" : \"per_" + transName + "(st:State)\"}\n");
        arrayTagPerFun.push("  %{\"_block\": \"BlockEnd\" , \"_id\" : \"per_" + transName + "(st:State)\"}\n\n");
        
        return arrayTagPerFun;
    }
    this.deleteContent = function(content)
    {
        var objectSearch = { 
                     wrap: true,
  				     wholeWord: false,
				     range: null
			           }
        		
        this.editor.find(content, objectSearch);
        this.editor.replace(""); 

    }
    this.deleteCondInTrans = function(transName, sourceName, targetName)
    { 
       var tagCond = this.buildTagCond(transName, sourceName, targetName);
       var content = this.getContentBetweenTags(tagCond[0], tagCond[1]);
    
       this.deleteContent(tagCond[0] + content + tagCond[1]);
    }
    this.deleteTransition = function(nameFun) 
    {        
        var tagFun = this.buildTagFunction(nameFun);
        var tagPerFun = this.buildTagPerFunction(nameFun);
        var contentFun;
        
        var contentPer = this.getContentBetweenTags(tagPerFun[0], tagPerFun[1]);

        this.deleteContent(tagPerFun[0]);
        this.deleteContent(contentPer);
        this.deleteContent(tagPerFun[1]);
        
        contentFun = this.getContentBetweenTags(tagFun[0], tagFun[1]);  

        this.deleteContent(tagFun[0]);
        this.deleteContent(contentFun);
        this.deleteContent(tagFun[1]);      
        
    }
    this.getStateNames = function()
    {
        var range = editor.getSelectionRange();
		var objectSearch = { 
  				             wholeWord: false,
				             range: null
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
        click : noFocus,
        addFieldInState : addFieldInState,
        addOperationInCondition: addOperationInCondition,
        hideTags: hideTags,
        showTags: showTags
	               /*addEntryCondition : addEntryCondition,
		       setInitialState   : setInitialState,
		       userModification  : userModification,
	               addConditionInTransition : addConditionInTransition*/	

   };




});
