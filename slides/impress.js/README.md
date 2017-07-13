impress.js
============

[![CircleCI](https://circleci.com/gh/henrikingo/impress.js.svg?style=svg)](https://circleci.com/gh/henrikingo/impress.js)

It's a presentation framework based on the power of CSS3 transforms and
transitions in modern browsers and inspired by the idea behind prezi.com.

**WARNING**

impress.js may not help you if you have nothing interesting to say ;)


HOW TO USE IT
---------------

Reference documentation of all impress.js features and API you can find it in [DOCUMENTATION.md](DOCUMENTATION.md).

The [HTML source code](index.html) of the official [impress.js demo](http://henrikingo.github.io/impress.js/) serves as a good example usage and contains comments explaning various features of impress.js. For more information about styling you can look into [CSS code](css/impress-demo.css) which shows how classes provided by impress.js can be used. Last but not least [JavaScript code of impress.js](js/impress.js) has some useful comments if you are interested in how everything works. Feel free to explore!

### Official demo

[impress.js demo](http://henrikingo.github.io/impress.js/) by [@bartaz](http://twitter.com/bartaz)

### Examples and demos

The [Classic Slides](http://henrikingo.github.io/impress.js/examples/classic-slides/) demo is targeted towards beginners, or can be used as a template for presentations that look like the traditional PowerPoint slide deck.

More examples and demos can be found on [Examples and demos wiki page](http://github.com/impress/impress.js/wiki/Examples-and-demos).

Feel free to add your own example presentations (or websites) there.

### Other tutorials and learning resources

If you want to learn even more there is a [list of tutorials and other learning resources](https://github.com/impress/impress.js/wiki/impress.js-tutorials-and-other-learning-resources)
on the wiki, too.

There is also a book available about [Building impressive presentations with impress.js](http://www.packtpub.com/building-impressive-presentations-with-impressjs/book) by Rakhitha Nimesh Ratnayake.


REPOSITORY STRUCTURE
--------------------

* [index.html](index.html): This is the official impress.js demo, showcasing all of the features 
  of the original impress.js, as well as some new plugins as we add them.
  * As already mentioned, this file is well commented and acts as the canonical documentation.
* [examples/](examples/): Contains [another demo](examples/classic-slides/index.html)
  that you can use as template for your first simple slide shows.
* [src/](src/): The main file is [src/impress.js](src/impress.js). Additional
  functionality is implemented as plugins in [src/plugins/](src/plugins/).
  * See [src/plugins/README.md](src/plugins/README.md) for information about
    the plugin API and how to write plugins.
* [test/](test/): Contains QUnit and Syn libraries that we use for writing tests,
  as well as some test coverage for core functionality. (Yes, more tests are
  much welcome.) Tests for plugins are in the directory of each plugin.
* [js/](js/): Contains [js/impress.js](js/impress.js), which contains a 
  concatenation of the core `src/impress.js` and all the plugins. Traditionally
  this is the file that you'll link to in a browser. In fact both the demo and
  test files do exactly that.
* [css/](css/]: Contains a CSS file used by the demo. This file is 
  **not required for using impress.js** in your own presentations. Impress.js
  creates the CSS it needs dynamically.
* [extras/](extras/) contains plugins that for various reasons aren't
  enabled by default. You have to explicitly add them with their own `script`
  element to use them.
* [build.js](build.js): Simple build file that creates `js/impress.js`. It also
  creates a minified version `impress.min.js`, but that one is not included in the
  github repository.
* [package.json](build.js): An NPM package specification. This was mainly added
  so you can easily install [buildify](https://www.npmjs.com/package/buildify)
  and run `node build.js`. Other than the build process (which is really just
  doing roughly `cat src/impress.js src/plugins/*/*.js > js/impress.js`) 
  `impress.js` itself doesn't depend on Node or any NPM modules.
* [bower.json](bower.json): A Bower package file. We also don't depend on Bower,
  but provide this file if you want to use it.

WANT TO CONTRIBUTE?
---------------------

For developers, once you've made changes to the code, you should run these commands for testing:

    npm run build
    npm run test
    npm run lint

Note that running `firefox qunit_test_runner.html` is usually more informative than running `karma` with `npm run test`. They both run the same tests.

More info about the [src/](src/) directory can be found in [src/plugins/README.md](src/plugins/README.md).

[Upstream impress.js](https://github.com/impress/impress.js/) has its own bureacracy around contributing. I welcome pull requests against this fork as well, just submit a PR on github and I'll be happy to look at it :-)

Note that if, for example, you want to add a new plugin, you should do it against [this fork](https://github.com/henrikingo/impress.js), since upstream impress.js doesn't have a plugin API yet. Hopefully one day the progress from this fork will trickle back to upstream repository.


ABOUT THE NAME
----------------

impress.js name in [courtesy of @skuzniak](http://twitter.com/skuzniak/status/143627215165333504).

It's an (un)fortunate coincidence that a Open/LibreOffice presentation tool is called Impress ;)

Reference API
--------------

See the [Reference API](DOCUMENTATION.md)

BROWSER SUPPORT
-----------------

The design goal for impress.js has been to showcase awesome CSS3 features as found in modern browser versions. We also use some new DOM functionality, and specifically do not use jQuery or any other JavaScript libraries, nor our own functions, to support older browsers. In general, recent versions of Firefox and Chrome are known to work well. IE works, except there are known issues with its CSS 3D implementation, so advanced presentations won't.

The typical use case for impress.js is to create presentations that you present from your own laptop, with a browser version you know works well. Some people also use impress.js successfully to embed animations or presentations in a web page, however, be aware that in this some of your visitors may not see the presentation correctly, or at all.

In particular, impress.js makes use of the following JS and CSS features:

* [DataSet API](http://caniuse.com/#search=dataset)
* [ClassList API](http://caniuse.com/#search=classlist)
* [CSS 3D Transforms](http://caniuse.com/#search=css%203d)
* [CSS Transitions](http://caniuse.com/#search=css%20transition)

COPYRIGHT AND LICENSE
---------------------

Copyright 2011-2016 Bartek Szopka - Released under the MIT [License](LICENSE)
