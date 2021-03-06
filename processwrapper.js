/**
Copyright (c) 2012

Patrick Oladimeji

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * A generic wrapper for spawning a process, sending messages to a process and shutting down a process 
 * @author Patrick Oladimeji
 * @date Dec 2, 2012 : 10:28:48 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require, module, process */
var spawn = require("child_process").spawn,
	exec = require("child_process").exec,
	util = require("util"),
	fs = require("fs");

module.exports = function () {
    "use strict";
    var proc;
    var o = {};
    
    /**
     * Starts an interactive process with the specified parameters. The opt variable should contain
     * at least the name of the process to start
     * @param opt - parameters for starting up the process. May contain the following properties
     *	processName: String
     *	args: Array
     *	onDataReceived: function to be called when the process sends something to its stdout
     *	onErrorReceived: function to be called when the process encounters an error
     *	onProcessExited: function to be called when the process exits
     *  
     * @returns {___anonymous325_326}
     */
    o.start = function (opt) {
        if (opt) {
            proc = spawn(opt.processName, opt.args, {uid: process.getuid(), gid: process.getgid()});
            
            proc.stdout.setEncoding('utf8');
            proc.stderr.setEncoding("utf8");
            if (opt.onDataReceived) {
                proc.stdout.on("data", opt.onDataReceived);
            }
            if (opt.onErrorReceived) {
                proc.stderr.on("data", opt.onErrorReceived);
            }
            if (opt.onProcessExited) {
                proc.on('exit', opt.onProcessExited);
            }
        }
        
        return o;
    };
    
    /**
     * execute a self terminating process
     * @param opt
     * @returns {___anonymous364_365}
     */
    o.exec = function (opt) {
        exec(opt.command, opt.callBack);
        return o;
    };
    /**
     * stop the process spawned
     * @returns {___anonymous364_365}
     */
    o.kill = function (signal) {
        signal = signal || 'SIGTERM';
        if (proc) {
            proc.kill(signal);
            proc.stdout.destroy();
            proc.stdin.destroy();
            proc.stderr.destroy();
            proc = undefined;
        }
        return o;
    };
    /**
     * send a command to the running process
     * @param command
     * @returns {___anonymous364_365}
     */
    o.sendCommand = function (command) {
        if (!proc.stdin.write(command)) {
            proc.stdin.on("drain", (function (c) {
                return function () { proc.stdin.write(c); };
            }(command)));
        }
        return o;
    };
    
    o.readFile = function (path, callback) {
        if (path && callback) {
            fs.readFile(path, "utf8", callback);
        }
    };
    
    o.writeFile = function (path, data, callback) {
        if (path && data && callback) {
            fs.writeFile(path, data, callback);
        }
    };
    return o;
};