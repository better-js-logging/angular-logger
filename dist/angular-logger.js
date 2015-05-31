(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global require */
var LoggingEnhancer = require('../bower_components/better-logging-base/dist/logging-enhancer.min').LoggingEnhancer;

(function (logEnhancer, angular, sprintf, moment) {
	'use strict';

	angular.module('logger', []).
	provider('logEnhancer', function() {
		var provider = this;

        this.datetimePattern = 'LLL'; 	// default datetime stamp pattern, overwrite in config phase
        this.datetimeLocale = window.navigator.userLanguage || window.navigator.language || 'en';
        this.prefixPattern = '%s::[%s]> '; 		    // default prefix pattern, overwrite in config phase
        this.LEVEL = logEnhancer.LEVEL;             // with these configure loglevels in config fase
        this.logLevels = {'*': this.LEVEL.TRACE}; 	// everything by everyone should be visible by default

		this.$get = function() {
			return {

                // Actually modifies $log. Without calling this in the run phase, $log remains untouched
				enhanceAngularLog : function($log) {
					$log.LEVEL = provider.LEVEL; // assign to $log, so the user can change them after config phase
					$log.logLevels = provider.logLevels; // assign to $log, so the user can change them after config phase

					$log.getInstance = function(context) {
						return {
							trace	: logEnhancer.enhanceLogging($log.debug, $log.LEVEL.TRACE, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
							debug	: logEnhancer.enhanceLogging($log.debug, $log.LEVEL.DEBUG, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
							log		: logEnhancer.enhanceLogging($log.log,   $log.LEVEL.INFO,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
							info	: logEnhancer.enhanceLogging($log.info,  $log.LEVEL.INFO,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
							warn	: logEnhancer.enhanceLogging($log.warn,  $log.LEVEL.WARN,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
							error	: logEnhancer.enhanceLogging($log.error, $log.LEVEL.ERROR, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern)
						};
					};
				}
			};
		};
	}).
	
	/*
		Default config and example config as well.
		Overrides default logging pattern and global logLevel
	*/
    config(['logEnhancerProvider', function (logEnhancerProvider) {
        logEnhancerProvider.datetimePattern = 'LLL';
        logEnhancerProvider.datetimeLocale = window.navigator.userLanguage || window.navigator.language || 'en';
        logEnhancerProvider.prefixPattern = '%s::[%s]> ';
        logEnhancerProvider.logLevels = {'*': logEnhancerProvider.LEVEL.TRACE};
        /*
            // example structure:
            logEnhancerProvider.logLevels = {
                'a.b.c': logEnhancerProvider.LEVEL.TRACE, // trace + debug + info + warn + error
                'a.b.d': logEnhancerProvider.LEVEL.ERROR, // error
                'a.b': logEnhancerProvider.LEVEL.DEBUG, // debug + info + warn + error
                'a': logEnhancerProvider.LEVEL.WARN, // warn + error
                '*': logEnhancerProvider.LEVEL.INFO // info + warn + error
            };
        */
    }]).
	
    run(['$log', 'logEnhancer', function ($log, logEnhancer) {
        if (!sprintf) {
            $log.warn('sprintf.js not found: https://github.com/alexei/sprintf.js, using fixed layout pattern "%s::[%s]> "');
        }
        if (!moment) {
            $log.warn('moment.js not found: http://momentjs.com, using non-localized simple Date format');
        }
        logEnhancer.enhanceAngularLog($log);
		$log.info('logging enhancer initiated');
    }]);
}(new LoggingEnhancer(window.sprintf, window.moment), window.angular, window.sprintf, window.moment));
},{"../bower_components/better-logging-base/dist/logging-enhancer.min":2}],2:[function(require,module,exports){
!function(){var n=function(n,e){var t=this;this.LEVEL={TRACE:4,DEBUG:3,INFO:2,WARN:1,ERROR:0,OFF:-1},this.enhanceLogging=function(o,r,i,l,u,f,a){function c(n,e,o){function r(n,e){if(n){if(void 0!==e.logLevels[n])return e.logLevels[n];if(-1!==n.indexOf("."))return r(n.substring(0,n.lastIndexOf(".")),e)}return void 0!==e.logLevels["*"]?e.logLevels["*"]:t.LEVEL.TRACE}return e>t.LEVEL.OFF&&e<=r(n,o)}function s(e,o,r,i,l){function u(e){var o="undefined"!=typeof n,r=o&&e.length>=2&&"string"==typeof e[0]&&-1!==e[0].indexOf("%");if(r)try{var i=t.countSprintfHolders(e[0]);i>0&&(e[0]=n.apply(null,e),e.splice(1,i))}catch(l){e.unshift(l)}return e}var f=d(o,r,i,l),a=u([].slice.call(e));return[f].concat([].slice.call(a))}function d(t,o,r,i){var l="";if("undefined"!=typeof e)l=e().locale(r).format(o);else{var u=new Date,f=(new Date).toTimeString().match(/^([0-9]{2}:[0-9]{2}:[0-9]{2})/)[0];l=u.getDate()+"-"+(u.getMonth()+1)+"-"+u.getFullYear()+" "+f}return"undefined"!=typeof n?n(i,l,t):l+"::["+t+"]> "}return l.logLevels=l.logLevels||[],function(){if(c(i,r,l)){var n=s(arguments,i,u,f,a);return o.apply(null,n),n}return null}},t.countSprintfHolders=function(e){function t(n){return function(){r=Math.max(r,n)}}var o=/\x25\([a-zA-Z0-9_]+\)[b-fijosuxX]/.test(e);if(o)return 1;var r=0;return n(e,t(1),t(2),t(3),t(4),t(5),t(6),t(7),t(8),t(9),t(10)),r}};if("undefined"!=typeof module)module.exports.LoggingEnhancer=n;else if("undefined"!=typeof exports)exports.LoggingEnhancer=n;else{if("undefined"==typeof window)throw new Error("unable to expose LoggingEnhancer: no module, exports object and no global window detected");window.loggingEnhancer=new n(window.sprintf,window.moment)}}();
},{}]},{},[1]);
