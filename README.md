#angular-logger
> Enhanced $log in AngularJS

## Getting Started
Enhance the $log service with the definition of one logger by context that prepend the output with context and  date/hour information.
Allow define format and a variable number of arguments. The placeholders in the format string are marked by % and are followed by one or more of these elements:
* An optional number followed by a `$` sign that selects which argument index to use for the value. If not specified, arguments will be placed in the same order as the placeholders in the input string.
* An optional `+` sign that forces to preceed the result with a plus or minus sign on numeric values. By default, only the `-` sign is used on negative numbers.
* An optional padding specifier that says what character to use for padding (if specified). Possible values are `0` or any other character precedeed by a `'` (single quote). The default is to pad with *spaces*.
* An optional `-` sign, that causes sprintf to left-align the result of this placeholder. The default is to right-align the result.
* An optional number, that says how many characters the result should have. If the value to be returned is shorter than this number, the result will be padded.
* An optional precision modifier, consisting of a `.` (dot) followed by a number, that says how many digits should be displayed for floating point numbers. When used on a string, it causes the result to be truncated.
* A type specifier that can be any of:
    * `%` — yields a literal `%` character
    * `b` — yields an integer as a binary number
    * `c` — yields an integer as the character with that ASCII value
    * `d` or `i` — yields an integer as a signed decimal number
    * `e` — yields a float using scientific notation
    * `u` — yields an integer as an unsigned decimal number
    * `f` — yields a float as is
    * `o` — yields an integer as an octal number
    * `s` — yields a string as is
    * `x` — yields an integer as a hexadecimal number (lower-case)
    * `X` — yields an integer as a hexadecimal number (upper-case)

See more at <a href="https://github.com/alexei/sprintf.js" target="_blank">sprintf.js</a>

As example the angular $log:
```
$log.debug ("Could't UPDATE resource "+resource.name+". Error: "+error.message+". Try again in "+delaySeconds+" seconds.")
-------------
Output: Could't UPDATE resource ADDRESS. Error: ROAD NOT LOCATED. Try again in 5 seconds.
```


With logger alternative:
 ```
var logger = $log.getInstance("SomeContext");
logger.debug("Could't UPDATE resource %s. Error: %s. Try again in %d seconds.", resource.name, error.message, delaySeconds)
--------
Output: Sunday 12:13:06 pm::[SomeContext]> > Could't UPDATE resource ADDRESS. Error: ROAD NOT LOCATED. Try again in 5 seconds.
 ```

Based on original post of:
<a href="http://blog.projectnibble.org/2013/12/23/enhance-logging-in-angularjs-the-simple-way/" target="_blank">Enhancing $log in AngularJs the simple way by Benny Bottema</a>

## Usage
1. Include logger.js, [momentjs](https://github.com/moment/moment) and [sprintf.js](https://github.com/alexei/sprintf.js) in your JavaScript files.
2. Add `logger` module as a dependency to your module:

    ```
    angular.module('YourModule', ['logger'])
    ```

2. Start logging with context info.
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
