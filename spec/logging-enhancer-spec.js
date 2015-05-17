/* global describe, beforeEach, expect, it*/
var moment = require("../bower_components/momentjs/moment.js");
var sprintf = require("../bower_components/sprintf/dist/sprintf.min.js").sprintf;

// the testsubject
var l = new (require("../src/logging-enhancer.js").LoggingEnhancer)(sprintf, moment);

var counters = [0,0,0,0,0,0];
var TRACE = 0, DEBUG = 1, LOG = 0, INFO = 1, WARN = 0, ERROR = 1;
var dummy = {
    trace: function() { counters[TRACE]++; },
    debug: function() { counters[DEBUG]++; },
    log: function() { counters[LOG]++; },
    info: function() { counters[INFO]++; },
    warn: function() { counters[WARN]++; },
    error: function() { counters[ERROR]++; }
};

describe("logging-enhancer", function() {
    
    beforeEach(function resetCounters() {
        counters = [0,0,0,0,0,0];
    });
    
    it("should log without prefix", function() {
        var f = l.enhanceLogging(dummy.trace, l.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '');
        
        expect(f("Hello World!")).toEqual(["", "Hello World!"]);
        expect(counters[TRACE]).toBe(1);
    });
    
    it("should log simple strings with prefix", function() {
        var f = l.enhanceLogging(dummy.error, l.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%s(%s): ');
        
        var datestr = moment().format('dddd hh');
        
        expect(f("Hello World!")).toEqual([datestr + "(dummy): ", "Hello World!"]);
        expect(f("%%")).toEqual([datestr + "(dummy): ", "%%"]);
        expect(counters[ERROR]).toBe(2);
    });
});