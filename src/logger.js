(function (angular, sprintf, vsprintf, moment) {
    'use strict';
    angular.module('logger', []).
    provider('logEnhancer', function () {
        this.loggingPattern = '%s - %s: ';

        this.$get = function () {
            var loggingPattern = this.loggingPattern;
            return {
                enhanceAngularLog: function ($log) {
                    $log.enabledContexts = [];

                    function enhanceLogging(loggingFunc, context, loggingPattern) {
                        return function () {
                            var contextEnabled = $log.enabledContexts[context];
                            if (contextEnabled === undefined || contextEnabled) {
                                var modifiedArguments = [].slice.call(arguments);
                                var output = [];
                                if (sprintf) {
                                    output.push(sprintf(loggingPattern, moment().format("dddd h:mm:ss a"), context));
                                    if (modifiedArguments.length > 1) { //format, arguments
                                        output.push(vsprintf(modifiedArguments[0], modifiedArguments.slice(1)));
                                    } else {
                                        output.push(modifiedArguments[0]);
                                    }
                                }
                                loggingFunc.apply(null, output);
                            }
                        };
                    }

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
                }
            };
        };
    }).
    config(['logEnhancerProvider',
        function (logEnhancerProvider) {
            logEnhancerProvider.loggingPattern = '%s::[%s]> ';
        }
    ]).
    run(['$log', 'logEnhancer',
        function ($log, logEnhancer) {
            if (!sprintf) {
                $log.warn("sprintf.js not found. https://github.com/alexei/sprintf.js");
            } else {
                $log.debug("sprintf.js located. ;o)");
            }
            logEnhancer.enhanceAngularLog($log);
        }
    ]);
}());
