(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global require */
var LoggingEnhancer = require('better-logging-base').LoggingEnhancer;

var sprintf = (window.sprintf && window.sprintf.sprintf) || window.sprintf; // depending on sprintf version
var moment = window.moment;
var angular = window.angular;

(function (logEnhancer, angular, sprintf, moment) {
	'use strict';

	angular.module('angular-logger', []).
	provider('logEnhancer', function() {
		var provider = this;

        this.datetimePattern = 'LLL'; 	// default datetime stamp pattern, overwrite in config phase
        this.datetimeLocale = window.navigator.userLanguage || window.navigator.language || 'en';
        this.prefixPattern = '%s::[%s]> '; 		    // default prefix pattern, overwrite in config phase
        this.LEVEL = logEnhancer.LEVEL;             // with these configure loglevels in config fase
        this.logLevels = {'*': this.LEVEL.TRACE}; 	// everything by everyone should be visible by default

		// instanceFactoryFactory moved here for modding purposes; now you can repurpose all the logging functions after they are enhanced
		this.instanceFactoryFactory = function($log) {
			return function(context) {
				return {
					trace	: logEnhancer.enhanceLogging($log.$$orig$log.debug, $log.LEVEL.TRACE, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
					debug	: logEnhancer.enhanceLogging($log.$$orig$log.debug, $log.LEVEL.DEBUG, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
					log		: logEnhancer.enhanceLogging($log.$$orig$log.log,   $log.LEVEL.INFO,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
					info	: logEnhancer.enhanceLogging($log.$$orig$log.info,  $log.LEVEL.INFO,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
					warn	: logEnhancer.enhanceLogging($log.$$orig$log.warn,  $log.LEVEL.WARN,  context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern),
					error	: logEnhancer.enhanceLogging($log.$$orig$log.error, $log.LEVEL.ERROR, context, $log, provider.datetimePattern, provider.datetimeLocale, provider.prefixPattern)
				};
			};
		};

		this.$get = function() {
			return {

                // Actually modifies $log. Without calling this in the run phase, $log remains untouched
				enhanceAngularLog : function($log) {
					$log.LEVEL = provider.LEVEL; // assign to $log, so the user can change them after config phase
					$log.logLevels = provider.logLevels; // assign to $log, so the user can change them after config phase

					$log.getInstance = provider.instanceFactoryFactory($log);
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
    
    config(['$provide', 'logEnhancerProvider', function ($provide, p) {
		$provide.decorator('$log', ['$delegate', function ($delegate) {
			$delegate.logLevels = p.logLevels; // copy the initial loglevel config
			return {
			    // keep original methods, otherwise the enhanced functions on .getInstance() will have a double (global context) prefix
			    $$orig$log: angular.extend({}, $delegate),
    			trace	: logEnhancer.enhanceLogging($delegate.debug, p.LEVEL.TRACE, 'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern),
    			debug	: logEnhancer.enhanceLogging($delegate.debug, p.LEVEL.DEBUG, 'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern),
    			log		: logEnhancer.enhanceLogging($delegate.log,   p.LEVEL.INFO,  'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern),
    			info	: logEnhancer.enhanceLogging($delegate.info,  p.LEVEL.INFO,  'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern),
    			warn	: logEnhancer.enhanceLogging($delegate.warn,  p.LEVEL.WARN,  'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern),
    			error	: logEnhancer.enhanceLogging($delegate.error, p.LEVEL.ERROR, 'global', $delegate, p.datetimePattern, p.datetimeLocale, p.prefixPattern)
			};
		}]);
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
}(new LoggingEnhancer(sprintf, moment), angular, sprintf, moment));

},{"better-logging-base":2}],2:[function(require,module,exports){
/* global module, exports, window */

/*
	LoggingEnhancer can be used to enhance any logging function and can be tested without angular
*/
(function() {
	
	'use strict';

	var LoggingEnhancer = function(sprintf, moment) {
		var self = this;

		this.LEVEL = { TRACE: 4, DEBUG: 3, INFO: 2, WARN: 1, ERROR: 0, OFF: -1 };

		// returns a value for testing purposes only
		this.enhanceLogging = function(loggingFunc, level, context, config, datetimePattern, datetimeLocale, prefixPattern) {
			config.logLevels = config.logLevels || [];
			return function() {
				if (levelPassesThreshold(context, level, config)) {
					var enhancedArguments = enhanceLogline(arguments, context, level, datetimePattern, datetimeLocale, prefixPattern);
					loggingFunc.apply(null, enhancedArguments);
					return enhancedArguments;
				}
				else {
					return null; // no log produced
				}
			};

			function levelPassesThreshold(context, level, config) {
				return level > self.LEVEL.OFF && level <= getLogLevelThreshold(context, config);

				function getLogLevelThreshold(context, config) {
					if (context) {
						if (config.logLevels[context] !== undefined) {
							return config.logLevels[context];
						}
						else if (context.indexOf('.') !== -1) {
							return getLogLevelThreshold(context.substring(0, context.lastIndexOf('.')), config);
						}
					}
					return config.logLevels['*'] !== undefined ? config.logLevels['*'] : self.LEVEL.TRACE;
				}
			}

			function enhanceLogline(args, context, level, datetimePattern, datetimeLocale, prefixPattern) {
				var prefix = generatePrefix(context, level, datetimePattern, datetimeLocale, prefixPattern);
				var processedArgs = maybeApplySprintf([].slice.call(args));
				return [prefix].concat([].slice.call(processedArgs));

				function maybeApplySprintf(args) {
					var sprintfAvailable = typeof sprintf !== 'undefined';
					var sprintfCandidate = sprintfAvailable && args.length >= 2 && typeof args[0] === 'string' && args[0].indexOf('%') !== -1;
					if (sprintfCandidate) {
						try {
							// apply sprintf with the proper arguments
							var placeholderCount = self.countSprintfHolders(args[0]);
							if (placeholderCount > 0) {
								args[0] = sprintf.apply(null, args);
								args.splice(1, placeholderCount); // remove arguments consumed by sprintf
							}
						}
						catch (e) {
							// invalid arguments passed into sprintf, continue without applying
							args.unshift(e);
						}
					}

					return args;
				}
			}

			function generatePrefix(context, level, datetimePattern, datetimeLocale, prefixPattern) {
				var dateStr = '';
				if (typeof moment !== 'undefined') {
					dateStr = moment().locale(datetimeLocale).format(datetimePattern);
				}
				else {
					var d = new Date();
					var timeStr = new Date().toTimeString().match(/^([0-9]{2}:[0-9]{2}:[0-9]{2})/)[0];
					dateStr = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + timeStr;
				}
				
				for (var levelName in self.LEVEL) {
					if (self.LEVEL[levelName] === level) { break; }
				}
				levelName = levelName.toLowerCase();

				if (typeof sprintf !== 'undefined') {
					return sprintf(prefixPattern, dateStr, context, levelName);
				}
				else {
					// use fixed layout: '%s::[%s]%s> '
					return dateStr + '::' + context + '::' + levelName + '> ';
				}
			}
		};

		self.countSprintfHolders = function(pattern) {
			var hasNamedHolders = /\x25\([a-zA-Z0-9_]+\)[b-fijosuxX]/.test(pattern);
			if (hasNamedHolders) {
				return 1;
			}

			var placeholderCounter = 0;

			function f(index) {
				return function() {
					// keep track of highest arg index, needed for single -but indexed- placeholders placeholder (ie. %6$s consumes the first 6 arguments)
					placeholderCounter = Math.max(placeholderCounter, index);
				};
			}

			sprintf(pattern, f(1), f(2), f(3), f(4), f(5), f(6), f(7), f(8), f(9), f(10));
			return placeholderCounter;
		};
	};

	if (typeof module !== 'undefined') {
		module.exports.LoggingEnhancer = LoggingEnhancer;
	} else if (typeof exports !== 'undefined') {
		exports.LoggingEnhancer = LoggingEnhancer;
	} else if (typeof window !== 'undefined') {
		window.loggingEnhancer = new LoggingEnhancer(window.sprintf, window.moment);
	} else {
		throw new Error('unable to expose LoggingEnhancer: no module, exports object and no global window detected');
	}
	
})();

},{}]},{},[1]);
