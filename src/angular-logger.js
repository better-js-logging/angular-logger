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