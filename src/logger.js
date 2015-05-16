/*global window*/
(function (angular, sprintf, vsprintf, moment) {
	'use strict';

	angular.module('logger', []).
	provider('logEnhancer', function() {
		var provider = this;

        this.datetimePattern = 'dddd h:mm:ss a'; 	// default datetime stamp pattern, overwrite in config phase
        this.loggingPattern = '%s::[%s]> '; 			// default logging pattern, overwrite in config phase
        this.LEVEL = { TRACE: 4, DEBUG: 3, INFO: 2, WARN: 1, ERROR: 0, OFF: -1 }; // with these configure loglevels in config fase
        this.logLevels = {'*': this.LEVEL.TRACE}; 	// everything by everyone should be visible by default

		this.$get = function() {
			return {

                // Actually modifies $log. Without calling this in the run phase, $log remains untouched
				enhanceAngularLog : function($log) {
					$log.LEVEL = provider.LEVEL; // assign to $log, so the user can change them after config phase
					$log.logLevels = provider.logLevels; // assign to $log, so the user can change them after config phase

					$log.getInstance = function(context) {
						return {
							trace	: enhanceLogging($log.debug, $log.LEVEL.TRACE, context, provider.datetimePattern, provider.loggingPattern),
							debug	: enhanceLogging($log.debug, $log.LEVEL.DEBUG, context, provider.datetimePattern, provider.loggingPattern),
							log		: enhanceLogging($log.log, 	 $log.LEVEL.INFO,  context, provider.datetimePattern, provider.loggingPattern),
							info	: enhanceLogging($log.info,  $log.LEVEL.INFO,  context, provider.datetimePattern, provider.loggingPattern),
							warn	: enhanceLogging($log.warn,  $log.LEVEL.WARN,  context, provider.datetimePattern, provider.loggingPattern),
							error	: enhanceLogging($log.error, $log.LEVEL.ERROR, context, provider.datetimePattern, provider.loggingPattern)
						};
					};

					function enhanceLogging(loggingFunc, level, context, datetimePattern, loggingPattern) {
						return function() {
                            if (levelPassesThreshold(context, level)) {
                                loggingFunc.apply(null, enhanceLogline(arguments, context, datetimePattern, loggingPattern));
                            }
						};

	                    function levelPassesThreshold(context, level) {
	                        return level > $log.LEVEL.OFF && level <= getLogLevelThreshold(context);

	                        function getLogLevelThreshold(context) {
	                        	if (context) {
		                            if ($log.logLevels[context] !== undefined) {
		                                return $log.logLevels[context];
		                            } else if (context.indexOf('.') != -1) {
		                                return getLogLevelThreshold(context.substring(0, context.lastIndexOf('.')));
		                            }
	                        	}
	                        	return $log.logLevels['*'] !== undefined ? $log.logLevels['*'] : $log.LEVEL.TRACE;
	                        }
	                    }

						function enhanceLogline(args, context, datetimePattern, loggingPattern) {
	                        var prefix = generatePrefix(context, datetimePattern, loggingPattern);
							var processedArgs = maybeApplySprintf([].slice.call(args));
							return [prefix].concat([].slice.call(processedArgs));
							
							function maybeApplySprintf(args) {
								var sprintfCandidate = sprintf && args.length >= 2 && typeof args[0] === 'string' && args[0].indexOf('%') !== -1;
		                        if (sprintfCandidate) {
		                        	try {
		                        		// count placeholders
			                        	var placeholderCount = 0;
			                        	var f = function() { return placeholderCount++ };
			                        	sprintf(args[0], f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f,f);
			                        	// apply sprintf with the proper arguments
			                        	if (placeholderCount > 0) {
			                        		args[0] = sprintf.apply(null, args);
			                        	}
			                        	// remove arguments consumed by sprintf
			                        	args.splice(1, placeholderCount);
		                        	} catch (e) {
		                        		// invalid arguments passed into sprintf, continue without applying
		                        	}
		                        }
		                        return args;
							}
						}

						function generatePrefix(context, datetimePattern, loggingPattern) {
							var dateStr = '';
	                        if (moment) {
	                            dateStr = moment().format(datetimePattern);
	                        } else {
	                            var d = new Date();
	                            var timeStr = new Date().toTimeString().match( /^([0-9]{2}:[0-9]{2}:[0-9]{2})/ )[0];
	                            dateStr = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear() + " " + timeStr;
	                        }

	                        if (sprintf) {
	                        	return sprintf(loggingPattern, dateStr, context);
	                        } else {
	                        	// use fixed layout: '%s::[%s]> '
	                        	return dateStr + '::[' + context + ']> ';
	                        }
						}
					}
				}
			};
		};
	}).
	/*
		Default config and example config as well.
		Overrides default logging pattern and global logLevel
	*/
    config(['logEnhancerProvider',
        function (logEnhancerProvider) {
            logEnhancerProvider.datetimePattern = 'dddd h:mm:ss a';
            logEnhancerProvider.loggingPattern = '%s::[%s]> ';
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
        }
    ]).
    run(['$log', 'logEnhancer',
        function ($log, logEnhancer) {
            if (!sprintf) {
                $log.warn("sprintf.js not found: https://github.com/alexei/sprintf.js, using fixed layout pattern '%s::[%s]> '");
            }
            if (!moment) {
                $log.warn("moment.js not found: http://momentjs.com, using simple Date format");
            }
            logEnhancer.enhanceAngularLog($log);
			$log.info('logging enhancer initiated');
        }
    ]);
}(window.angular, window.sprintf, window.vsprintf, window.moment));