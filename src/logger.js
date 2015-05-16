/*global window*/
(function (angular, sprintf, vsprintf, moment) {
	'use strict';

	angular.module('logger', []).
	provider('logEnhancer', function() {
		var provider = this;

        this.loggingPattern = '%s - %s: '; // default logging pattern, overwrite in config phase
        this.LEVEL = { TRACE: 4, DEBUG: 3, INFO: 2, WARN: 1, ERROR: 0, OFF: -1 }; // with these configure loglevels in config fase
        this.logLevels = {'*': this.LEVEL.TRACE}; // everything by everyone should be visible by default

		this.$get = function() {
			return {

                // Actually modifies $log. Without calling this in the run phase, $log remains untouched
				enhanceAngularLog : function($log) {
					$log.LEVEL = provider.LEVEL; // assign to $log, so the user can change them after config phase
					$log.logLevels = provider.logLevels; // assign to $log, so the user can change them after config phase

					$log.getInstance = function(context) {
						return {
							trace	: enhanceLogging($log.debug, $log.LEVEL.TRACE, context, provider.loggingPattern),
							debug	: enhanceLogging($log.debug, $log.LEVEL.DEBUG, context, provider.loggingPattern),
							log		: enhanceLogging($log.log, $log.LEVEL.INFO, context, provider.loggingPattern),
							info	: enhanceLogging($log.info, $log.LEVEL.INFO, context, provider.loggingPattern),
							warn	: enhanceLogging($log.warn, $log.LEVEL.WARN, context, provider.loggingPattern),
							error	: enhanceLogging($log.error, $log.LEVEL.ERROR, context, provider.loggingPattern)
						};
					};

					function enhanceLogging(loggingFunc, level, context, loggingPattern) {
						return function() {
                            if (levelPassesThreshold(context, level)) {
                                loggingFunc.apply(null, enhanceLogline(arguments, context, loggingPattern));
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
	                        	return $log.logLevels['*'];
	                        }
	                    }

						function enhanceLogline(args, context, loggingPattern) {
	                        var prefix = generatePrefix(context, loggingPattern);
							return [prefix].concat([].slice.call(args));
						}

						function generatePrefix(context, loggingPattern) {
							var dateStr = '';
	                        if (moment) {
	                            dateStr = moment().format("dddd h:mm:ss a");
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
    config(['logEnhancerProvider',
        function (logEnhancerProvider) {
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