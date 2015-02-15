#angular-logger
> Enhanced $log in AngularJS

## Getting Started
Enhance the $log service with the definition of one logger by context that prepend the output with context and  date/hour information. As example the $log output:

    Couldn't UPDATE doc: Object, error: CustomPouchError

will be logger as:

    Sunday 12:13:06 pm::[somecontext]> Couldn't UPDATE doc: Object, error: CustomPouchError

Based on original post of: 
<a href="http://blog.projectnibble.org/2013/12/23/enhance-logging-in-angularjs-the-simple-way/" target="_blank">Enhancing $log in AngularJs the simple way by Benny Bottema</a>

## Usage
1. Include logger.js and [sprintf.js](https://github.com/alexei/sprintf.js) in your JavaScript files.
2. Add `logger` module as a dependency to your module:

    ```
    angular.module('YourModule', ['logger'])
    ```

3. Make a configuration block that turns on or off logging:
    ```
      module. config(['logEnhancerProvider', function (logEnhancerProvider) {
							    logEnhancerProvider.loggingPattern = '%s::[%s]> ';
			}])
    }]);
    ```
4. Start logging with context info.
    ```
    app.controller('LogTestCtrl', function ($log) {
    var notMutedLogger = $log.getInstance('Not Muted');
    var mutedLogger = $log.getInstance('Muted');

    mutedLogger.enableLogging(false);

    this.doTest = function () {
        notMutedLogger.info("This *will* appear in your console");
        mutedLogger.info("This will *not* appear in your console");
    }
});
	```
	
##Future work
Some usefull enhanced points (suggestions will be wellcome):
* Configure logger levels by context regexp as <a href="http://docs.oracle.com/javase/8/docs/technotes/guides/logging/overview.html" target="_blank">Java logger API </a> does. The level's order are the following:
```
  1. DEBUG: Show debug messages and the lower levels, is the  finest output and only recommended to develop stages.
  2. INFO :  Show info messages and lower, i.e: INFO, WARN and ERROR.
  3. WARN :  Show warn messages and lower, i.e: WARN and ERROR.
  4. ERROR: Show only error messages.
  5. OFF  : Disable all levels.
```

Example:  
   ```
  logLevels.add('*', WARN);                               //All context enabled WARING (ERROR E
  logLevels.add('somecontext.developcontext.*', DEBUG);  //Debug on developcontext and subcontext.
  logLevels.add('somecontext.stablecontext.*', OFF);    // Disable log on the real stable context and subcontext.
   ```

Copyright (c) 2015 pdorgambide
