/* global describe, beforeEach, expect, it*/
var moment = require("../bower_components/momentjs/moment.js");
var sprintf = require("../bower_components/sprintf/dist/sprintf.min.js").sprintf;

// the testsubject
var enh = new (require("../src/logging-enhancer.js").LoggingEnhancer)(sprintf, moment);

var counters = [0,0,0,0,0,0];
var TRACE = 0, DEBUG = 1, LOG = 2, INFO = 3, WARN = 4, ERROR = 5;
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
    
    it("should log with various prefix configurations", function() {
        var f_none      = enh.enhanceLogging(dummy.trace, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '');
        var f_both      = enh.enhanceLogging(dummy.trace, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%s(%s): ');
        var f_date1     = enh.enhanceLogging(dummy.warn, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%s: ');
        var f_date2     = enh.enhanceLogging(dummy.warn, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%1$s: ');
        var f_context   = enh.enhanceLogging(dummy.error, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%2$s: ');
        var f_reversed  = enh.enhanceLogging(dummy.debug, enh.LEVEL.TRACE, 'dummy', {}, 'dddd hh', '%2$s(%1$s): ');
        
        var datestr = moment().format('dddd hh'); // as we can't mock momentjs, let's at least have an hour resolution
        
        expect(f_none("Hello World!"))           .toEqual(["", "Hello World!"]);
        expect(f_both("Hello World!"))      .toEqual([datestr + "(dummy): ", "Hello World!"]);
        expect(f_both("%%"))                .toEqual([datestr + "(dummy): ", "%%"]);
        expect(f_date1("Hello World!"))     .toEqual([datestr + ": ", "Hello World!"]);
        expect(f_date2("Hello World!"))     .toEqual([datestr + ": ", "Hello World!"]);
        expect(f_context("Hello World!"))   .toEqual(["dummy: ", "Hello World!"]);
        expect(f_reversed("Hello World!"))  .toEqual(["dummy(" + datestr + "): ", "Hello World!"]);
        
        expect(counters[TRACE]).toBe(3);
        expect(counters[WARN]).toBe(2);
        expect(counters[ERROR]).toBe(1);
        expect(counters[DEBUG]).toBe(1);
    });
    
    // it should work with simple replacements
    // it should work with simple extra objects
    // it should work with replacements and extra objects
    // it should works with moment patterns
    // it should works with prefix patterns
    // it should work without sprintf
    // it should work without moment
    // it should work with simple priorities
    // it should work with with global wildcard priority
    // it should work with nested priorities
});