#angular-logger

* Enhances Angular's `$log` service so that you can define **separate contexts to log for**, where the output will be prepended with the context's name and a datetime stamp.
* Further enhances the logging functions so that you can **apply patterns** eliminatinging the need of manually concatenating your strings
* Introduces **log levels**, where you can manage logging output per context or even a group of contexts
* Works as a **complete drop-in** replacement for your current `$log.log` or `console.log` statements
* [original post](http://blog.projectnibble.org/2013/12/23/enhance-logging-in-angularjs-the-simple-way/)

---

- [Installing](#)
		- [Bower](#)
		- [Manually](#)
- [Getting Started](#)
- [Applying Patterns](#)
		- [Prefix pattern](#)
		- [Datetime stamp patterns](#)
		- [Logging patterns](#)
- [Managing logging priority](#)

---

## Installing

angular-logger has optional dependencies on _[momentjs](https://github.com/moment/moment)_ and _[sprintf.js](https://github.com/alexei/sprintf.js)_: without moment you can't pattern a nicely readable datetime stamp and without sprintf you can't pattern your logging input lines. Default fixed patterns are applied if either they are missing.

#### Bower

Will be implemented under [issue #10](https://github.com/pdorgambide/angular-logger/issues/10)

#### Manually

Include _logger.js_, _[momentjs](https://github.com/moment/moment)_ and _[sprintf.js](https://github.com/alexei/sprintf.js)_ in your web app.

## Getting Started

1. Add `logger` module as a dependency to your module:

   ```javascript
   angular.module('YourModule', ['logger'])
   ```
2. Start logging for your context

   ```javascript
   app.controller('LogTestCtrl', function ($log) {
      var notMutedLogger = $log.getInstance('Not Muted');
      var mutedLogger = $log.getInstance('Muted');
   
      $log.logLevels['Muted'] = $log.LEVEL.OFF;
   
      this.doTest = function () {
         notMutedLogger.info("This *will* appear in your console");
         mutedLogger.info("This will *not* appear in your console");
      }
   });
   ```
   [working demo](http://jsfiddle.net/plantface/d7qkaumr/)

## Applying Patterns
#### Prefix pattern

By default, the prefix is formatted like so:

`datetime here::[context's name here]>your logging input here`

However, you can change this as follows:

```javascript
app.config(function (logEnhancerProvider) {
   logEnhancerProvider.loggingPattern = '%s - %s: ';
});
app.run(function($log) {
   $log.getInstance('app').info('Hello World');
});
// was:    Sunday 12:55:07 am::[app]>Hello World
// became: Sunday 12:55:07 am - app: Hello World
```

#### Datetime stamp patterns

If you have included _moment.js_ in your webapp, you can start using datetime stamp patterns with angular-logger. The default pattern is `dddd h:mm:ss a`, which translates to _Sunday 12:55:07 am_. You customize the pattern as follows:

```javascript
app.config(function (logEnhancerProvider) {
   logEnhancerProvider.datetimePattern = 'dddd';
});
app.run(function($log) {
   $log.getInstance('app').info('Hello World');
});
// was:    Sunday 12:55:07 am::[app]>Hello World
// became: Sunday::[app]>Hello World
```

This way you can switch to a 24h format this way as well, for example.

 * For all options, see [moment.js](http://momentjs.com/docs/#/displaying/)

#### Logging patterns

If you have included _sprintf.js_ in your webapp, you can start using patterns with _angular-logger_.

Old way of logging using `$log`:
```javascript
$log.debug ("Could't UPDATE resource "+resource.name+". Error: "+error.message+". Try again in "+delaySeconds+" seconds.")
// Could't UPDATE resource ADDRESS. Error: ROAD NOT LOCATED. Try again in 5 seconds.
```

New way of logging using enhanced `$log`:
 ```javascript
var logger = $log.getInstance("SomeContext");
logger.debug("Could't UPDATE resource %s. Error: %s. Try again in %d seconds.", resource.name, error.message, delaySeconds)
// Sunday 12:13:06 pm::[SomeContext]> > Could't UPDATE resource ADDRESS. Error: ROAD NOT LOCATED. Try again in 5 seconds.
 ```
 
You can even combine pattern input and normal input:
 ```javascript
var logger = $log.getInstance('test');
logger.warn("This %s pattern %j", "is", "{ 'in': 'put' }", "but this is not!", ['this', 'is', ['handled'], 'by the browser'], { 'including': 'syntax highlighting', 'and': 'console interaction' });
// 17-5-2015 00:16:08::[test]>  This is pattern "{ 'in': 'put' }" but this is not! ["this", "is handled", "by the browser"] Object {including: "syntax highlighting", and: "console interaction"}
 ```

 * For all options, see [sprintf.js](https://github.com/alexei/sprintf.js)

[working demo](https://jsfiddle.net/plantface/qkobLe0m/)

## Managing logging priority

Using logging levels, we can manage output on several levels. Contexts can be named using dot '.' notation, where the names before dots are intepreted as groups or packages.

For example for `'a.b'` and `a.c` we can define a general log level for `a` and have a different log level for only 'a.c'.

The following logging functions (left side) are available:

logging function  | mapped to: | with logLevel
----------------- | --------------- | --------------
_`logger.trace`_  | _`$log.debug`_       | `TRACE`
_`logger.debug`_  | _`$log.debug`_       | `DEBUG`
_`logger.log*`_   | _`$log.log`_        | `INFO`
_`logger.info`_   | _`$log.info`_        | `INFO`
_`logger.warn`_   | _`$log.warn`_        | `WARN`
_`logger.error`_  | _`$log.error`_       | `ERROR`
`*` maintained for backwards compatibility with `$log.log`

The level's order are as follows:
```
  1. TRACE: displays all levels, is the finest output and only recommended during debugging
  2. DEBUG: display all but the finest logs, only recommended during develop stages
  3. INFO :  Show info, warn and error messages
  4. WARN :  Show warn and error messages
  5. ERROR: Show only error messages.
  6. OFF  : Disable all logging, recommended for silencing noisy logging during debugging. *will* surpress errors logging.
```
Example:

```javascript
// config log levels before the application wakes up
app.config(function (logEnhancerProvider) {
    logEnhancerProvider.loggingPattern = '%s::[%s]> ';
    logEnhancerProvider.logLevels = {
        'a.b.c': logEnhancerProvider.LEVEL.TRACE, // trace + debug + info + warn + error
        'a.b.d': logEnhancerProvider.LEVEL.ERROR, // error
        'a.b': logEnhancerProvider.LEVEL.DEBUG, // debug + info + warn + error
        'a': logEnhancerProvider.LEVEL.WARN, // warn + error
        '*': logEnhancerProvider.LEVEL.INFO // info + warn + error
    };
    // globally only INFO and more important are logged
    // for group 'a' default is WARN and ERROR
    // a.b.c and a.b.d override logging everything-with-TRACE and least-with-ERROR respectively
});


// config log levels after the application started running
run(function ($log) {
    $log.logLevels = {
        'a.b.c': $log.LEVEL.TRACE, // trace + debug + info + warn + error
        'a.b.d': $log.LEVEL.ERROR, // error
        'a.b': $log.LEVEL.DEBUG, // debug + info + warn + error
        'a': $log.LEVEL.WARN, // warn + error
        '*': $log.LEVEL.INFO // info + warn + error
    };
});
```

Alternative notation:

```javascript
$log.logLevels['a.b.c'] = $log.LEVEL.TRACE;
$log.logLevels['a.b.d'] = $log.LEVEL.ERROR;
// etc.
```
