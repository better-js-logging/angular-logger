define([
'angular','sprintf'
],
function(angular) {
	'use strict';
	return angular.module('logger', []).
							//Services
							provider('logEnhancer', function () {
							    this.loggingPattern = '%s - %s: ';

							    this.$get = function () {
							        var loggingPattern = this.loggingPattern;
							        return {
							            enhanceAngularLog: function ($log) {
							                $log.enabledContexts = [];

							                $log.getInstance = function (context) {
							                    return {
							                        log: enhanceLogging($log.log, context, loggingPattern),
							                        info: enhanceLogging($log.info, context, loggingPattern),
							                        warn: enhanceLogging($log.warn, context, loggingPattern),
							                        debug: enhanceLogging($log.debug, context, loggingPattern),
							                        error: enhanceLogging($log.error, context, loggingPattern),
							                        enableLogging: function (enable) {
							                            $log.enabledContexts[context] = enable;
							                        }
							                    };
							                };

							                function enhanceLogging(loggingFunc, context, loggingPattern) {
							                    return function () {
							                        var contextEnabled = $log.enabledContexts[context];
							                        if (contextEnabled === undefined || contextEnabled) {
							                            var modifiedArguments = [].slice.call(arguments);
							                            if(sprintf)
							                            	modifiedArguments[0] = [sprintf(loggingPattern, moment().format("dddd h:mm:ss a"), context)] + modifiedArguments[0];
							                            loggingFunc.apply(null, modifiedArguments);
							                        }
							                    };
							                }
							            }
							        };
							    };
							}).
							config(['logEnhancerProvider', function (logEnhancerProvider) {
							    logEnhancerProvider.loggingPattern = '%s::[%s]> ';
							}]).
							run(['$log', 'logEnhancer', function ($log, logEnhancer) {
							    if(!sprintf){
							    	$log.warn("sprintf.js not found. https://github.com/alexei/sprintf.js")
							    }
							    else {
							    	$log.debug("sprintf.js located. ;o)")
							    }
								logEnhancer.enhanceAngularLog($log);
							}]);
							
							provider('loggerConfig',function() {
								//Config attributes
								var _config={
										
								};
								
								this.extendConfig=function(config){
									_config=angular.extend(_config,config);
								};
								this.$get = function() {
									return _config;
						        };
							});
});
