/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 *
 * Released under the MIT and GPL Licenses.
 *
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, latedef:true, newcap:true,
         noarg:true, noempty:true, undef:true, strict:true, browser:true */

// You are one of those who like to know how things work inside?
// Let me show you the cogs that make impress.js run...
(function ( document, window ) {
    'use strict';
    
    // HELPER FUNCTIONS
    
    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    var pfx = (function () {
        
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                
                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            
            }
            
            return memory[ prop ];
        };
    
    })();
    
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    var arrayify = function ( a ) {
        return [].slice.call( a );
    };
    
    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    var css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    };
    
    // `toNumber` takes a value given as `numeric` parameter and tries to turn
    // it into a number. If it is not possible it returns 0 (or other value
    // given as `fallback`).
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };
    
    var validateOrder = function ( order, fallback ) {
        var validChars = "xyz";
        var returnStr = "";
        if ( typeof order == "string" ) {
            for ( var i in order.split("") ) {
                if( validChars.indexOf( order[i] >= 0 ) ) {
                    returnStr += order[i];
                    // Each of x,y,z can be used only once.
                    validChars = validChars.split(order[i]).join("");
                }
            }
        }
        if ( returnStr )
            return returnStr;
        else if ( fallback !== undefined )
            return fallback;
        else
            return "xyz";
    };
    
    // `byId` returns element with given `id` - you probably have guessed that ;)
    var byId = function ( id ) {
        return document.getElementById(id);
    };
    
    // `$` returns first element for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $ = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
    
    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $$ = function ( selector, context ) {
        context = context || document;
        return arrayify( context.querySelectorAll(selector) );
    };
    
    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };
    
    // `translate` builds a translate transform string for given data.
    var translate = function ( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };
    
    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    var rotate = function ( r, revert ) {
        var order = r.order ? r.order : "xyz";
        var css = "";
        var axes = order.split("");
        if ( revert ) {
            axes = axes.reverse();
        }

        for ( var i in axes ) {
            css += " rotate" + axes[i].toUpperCase() + "(" + r[axes[i]] + "deg)"
        }
        return css;
    };
    
    // `scale` builds a scale transform string for given data.
    var scale = function ( s ) {
        return " scale(" + s + ") ";
    };
    
    // `perspective` builds a perspective transform string for given data.
    var perspective = function ( p ) {
        return " perspective(" + p + "px) ";
    };
    
    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    var getElementFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return byId( window.location.hash.replace(/^#\/?/,"") );
    };
    
    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    var computeWindowScale = function ( config ) {
        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;
        
        if (config.maxScale && scale > config.maxScale) {
            scale = config.maxScale;
        }
        
        if (config.minScale && scale < config.minScale) {
            scale = config.minScale;
        }
        
        return scale;
    };
    
    // CHECK SUPPORT
    var body = document.body;
    var impressSupported = 
                          // browser should support CSS 3D transtorms 
                           ( pfx("perspective") !== null ) &&
                          // and `classList` and `dataset` APIs
                           ( body.classList ) &&
                           ( body.dataset );
    
    if (!impressSupported) {
        // we can't be sure that `classList` is supported
        body.className += " impress-not-supported ";
    }
    // GLOBALS AND DEFAULTS
    
    // This is where the root elements of all impress.js instances will be kept.
    // Yes, this means you can have more than one instance on a page, but I'm not
    // sure if it makes any sense in practice ;)
    var roots = {};
    
    var preInitPlugins = [];
    var preStepLeavePlugins = [];
    
    // some default config values.
    var defaults = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,
        
        perspective: 1000,
        
        transitionDuration: 1000
    };
    
    // it's just an empty function ... and a useless comment.
    var empty = function () { return false; };
    
    // IMPRESS.JS API
    
    // And that's where interesting things will start to happen.
    // It's the core `impress` function that returns the impress.js API
    // for a presentation based on the element with given id ('impress'
    // by default).
    var impress = window.impress = function ( rootId ) {
        
        // If impress.js is not supported by the browser return a dummy API
        // it may not be a perfect solution but we return early and avoid
        // running code that may use features not implemented in the browser.
        if (!impressSupported) {
            return {
                init: empty,
                goto: empty,
                prev: empty,
                next: empty,
                addPreInitPlugin: empty,
                addPreStepLeavePlugin: empty,
                lib: {}
            };
        }
        
        rootId = rootId || "impress";
        
        // if given root is already initialized just return the API
        if (roots["impress-root-" + rootId]) {
            return roots["impress-root-" + rootId];
        }
        
        // The gc library depends on being initialized before we do any changes to DOM.
        var lib = initLibraries(rootId);
        if (lib === "error") return;
        
        body.classList.remove("impress-not-supported");
        body.classList.add("impress-supported");

        // data of all presentation steps
        var stepsData = {};
        
        // element of currently active step
        var activeStep = null;
        
        // current state (position, rotation and scale) of the presentation
        var currentState = null;
        
        // array of step elements
        var steps = null;
        
        // configuration options
        var config = null;
        
        // scale factor of the browser window
        var windowScale = null;        
        
        // root presentation elements
        var root = byId( rootId );
        var canvas = document.createElement("div");
        
        var initialized = false;
        
        // STEP EVENTS
        //
        // There are currently two step events triggered by impress.js
        // `impress:stepenter` is triggered when the step is shown on the 
        // screen (the transition from the previous one is finished) and
        // `impress:stepleave` is triggered when the step is left (the
        // transition to next step just starts).
        
        // reference to last entered step
        var lastEntered = null;
        
        // `onStepEnter` is called whenever the step element is entered
        // but the event is triggered only if the step is different than
        // last entered step.
        // We sometimes call `goto`, and therefore `onStepEnter`, just to redraw a step, such as
        // after screen resize. In this case - more precisely, in any case - we trigger a
        // `impress:steprefresh` event.
        var onStepEnter = function (step) {
            if (lastEntered !== step) {
                triggerEvent(step, "impress:stepenter");
                lastEntered = step;
            }
            triggerEvent(step, "impress:steprefresh");
        };
        
        // `onStepLeave` is called whenever the step element is left
        // but the event is triggered only if the step is the same as
        // last entered step.
        var onStepLeave = function (currentStep, nextStep) {
            if (lastEntered === currentStep) {
                triggerEvent(currentStep, "impress:stepleave", { next : nextStep } );
                lastEntered = null;
            }
        };
        
        // `initStep` initializes given step element by reading data from its
        // data attributes and setting correct styles.
        var initStep = function ( el, idx ) {
            var data = el.dataset,
                step = {
                    translate: {
                        x: toNumber(data.x),
                        y: toNumber(data.y),
                        z: toNumber(data.z)
                    },
                    rotate: {
                        x: toNumber(data.rotateX),
                        y: toNumber(data.rotateY),
                        z: toNumber(data.rotateZ || data.rotate),
                        order: validateOrder(data.rotateOrder)
                    },
                    scale: toNumber(data.scale, 1),
                    transitionDuration: toNumber(data.transitionDuration, config.transitionDuration),
                    el: el
                };
            
            if ( !el.id ) {
                el.id = "step-" + (idx + 1);
            }
            
            stepsData["impress-" + el.id] = step;
            
            css(el, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           translate(step.translate) +
                           rotate(step.rotate) +
                           scale(step.scale),
                transformStyle: "preserve-3d"
            });
        };
        
        // Initialize all steps.
        // Read the data-* attributes, store in internal stepsData, and render with CSS.
        var initAllSteps = function() {
            steps = $$(".step", root);
            steps.forEach( initStep );
        };
        
        // `init` API function that initializes (and runs) the presentation.
        var init = function () {
            if (initialized) { return; }
            execPreInitPlugins(root);
            
            // First we set up the viewport for mobile devices.
            // For some reason iPad goes nuts when it is not done properly.
            var meta = $("meta[name='viewport']") || document.createElement("meta");
            meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if (meta.parentNode !== document.head) {
                meta.name = 'viewport';
                document.head.appendChild(meta);
            }
            
            // initialize configuration object
            var rootData = root.dataset;
            config = {
                width: toNumber( rootData.width, defaults.width ),
                height: toNumber( rootData.height, defaults.height ),
                maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
                minScale: toNumber( rootData.minScale, defaults.minScale ),                
                perspective: toNumber( rootData.perspective, defaults.perspective ),
                transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
            };
            
            windowScale = computeWindowScale( config );
            
            // wrap steps with "canvas" element
            arrayify( root.childNodes ).forEach(function ( el ) {
                canvas.appendChild( el );
            });
            root.appendChild(canvas);
            
            // set initial styles
            document.documentElement.style.height = "100%";
            
            css(body, {
                height: "100%",
                overflow: "hidden"
            });
            
            var rootStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };
            
            css(root, rootStyles);
            css(root, {
                top: "50%",
                left: "50%",
                transform: perspective( config.perspective/windowScale ) + scale( windowScale )
            });
            css(canvas, rootStyles);
            
            body.classList.remove("impress-disabled");
            body.classList.add("impress-enabled");
            
            // get and init steps
            initAllSteps();
            
            // set a default initial state of the canvas
            currentState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0, order: "xyz" },
                scale:     1
            };
            
            initialized = true;
            
            triggerEvent(root, "impress:init", { api: roots[ "impress-root-" + rootId ] });
        };
        
        // `getStep` is a helper function that returns a step element defined by parameter.
        // If a number is given, step with index given by the number is returned, if a string
        // is given step element with such id is returned, if DOM element is given it is returned
        // if it is a correct step element.
        var getStep = function ( step ) {
            if (typeof step === "number") {
                step = step < 0 ? steps[ steps.length + step] : steps[ step ];
            } else if (typeof step === "string") {
                step = byId(step);
            }
            return (step && step.id && stepsData["impress-" + step.id]) ? step : null;
        };
        
        // used to reset timeout for `impress:stepenter` event
        var stepEnterTimeout = null;
        
        // `goto` API function that moves to step given with `el` parameter (by index, id or element),
        // with a transition `duration` optionally given as second parameter.
        var goto = function ( el, duration, reason ) {
            reason = reason || "goto";
            
            if ( !initialized ) {
                return false;
            }
            
            // Re-execute initAllSteps for each transition. This allows to edit step attributes dynamically,
            // such as change their coordinates, or even remove or add steps, and have that change
            // apply when goto() is called.
            initAllSteps();
            
            if ( !(el = getStep(el)) ) {
                return false;
            }
            
            // Sometimes it's possible to trigger focus on first link with some keyboard action.
            // Browser in such a case tries to scroll the page to make this element visible
            // (even that body overflow is set to hidden) and it breaks our careful positioning.
            //
            // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
            // whenever slide is selected
            //
            // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
            window.scrollTo(0, 0);
            
            var step = stepsData["impress-" + el.id];
            duration = (duration !== undefined ? duration : step.transitionDuration);
            
            // If we are in fact moving to another step, start with executing the registered preStepLeave plugins.
            if (activeStep && activeStep !== el) {
                var event = { target: activeStep, detail : {} };
                event.detail.next = el;
                event.detail.transitionDuration = duration;
                event.detail.reason = reason;
                execPreStepLeavePlugins(event);
                // Plugins are allowed to change the detail values
                el = event.detail.next;
                step = stepsData["impress-" + el.id];
                duration = event.detail.transitionDuration;
            }
            
            if ( activeStep ) {
                activeStep.classList.remove("active");
                body.classList.remove("impress-on-" + activeStep.id);
            }
            el.classList.add("active");
            
            body.classList.add("impress-on-" + el.id);
            
            // compute target state of the canvas based on given step
            var target = {
                rotate: {
                    x: -step.rotate.x,
                    y: -step.rotate.y,
                    z: -step.rotate.z,
                    order: step.rotate.order
                },
                translate: {
                    x: -step.translate.x,
                    y: -step.translate.y,
                    z: -step.translate.z
                },
                scale: 1 / step.scale
            };
            
            // Check if the transition is zooming in or not.
            //
            // This information is used to alter the transition style:
            // when we are zooming in - we start with move and rotate transition
            // and the scaling is delayed, but when we are zooming out we start
            // with scaling down and move and rotation are delayed.
            var zoomin = target.scale >= currentState.scale;
            
            duration = toNumber(duration, config.transitionDuration);
            var delay = (duration / 2);
            
            // if the same step is re-selected, force computing window scaling,
            // because it is likely to be caused by window resize
            if (el === activeStep) {
                windowScale = computeWindowScale(config);
            }
            
            var targetScale = target.scale * windowScale;
            
            // trigger leave of currently active element (if it's not the same step again)
            if (activeStep && activeStep !== el) {
                onStepLeave(activeStep, el);
            }
            
            // Now we alter transforms of `root` and `canvas` to trigger transitions.
            //
            // And here is why there are two elements: `root` and `canvas` - they are
            // being animated separately:
            // `root` is used for scaling and `canvas` for translate and rotations.
            // Transitions on them are triggered with different delays (to make
            // visually nice and 'natural' looking transitions), so we need to know
            // that both of them are finished.
            css(root, {
                // to keep the perspective look similar for different scales
                // we need to 'scale' the perspective, too
                transform: perspective( config.perspective / targetScale ) + scale( targetScale ),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? delay : 0) + "ms"
            });
            
            css(canvas, {
                transform: rotate(target.rotate, true) + translate(target.translate),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? 0 : delay) + "ms"
            });
            
            // Here is a tricky part...
            //
            // If there is no change in scale or no change in rotation and translation, it means there was actually
            // no delay - because there was no transition on `root` or `canvas` elements.
            // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
            // and target values to check if delay should be taken into account.
            //
            // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
            // - it's simply comparing all the values.
            if ( currentState.scale === target.scale ||
                (currentState.rotate.x === target.rotate.x && currentState.rotate.y === target.rotate.y &&
                 currentState.rotate.z === target.rotate.z && currentState.translate.x === target.translate.x &&
                 currentState.translate.y === target.translate.y && currentState.translate.z === target.translate.z) ) {
                delay = 0;
            }
            
            // store current state
            currentState = target;
            activeStep = el;
            
            // And here is where we trigger `impress:stepenter` event.
            // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
            //
            // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
            // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
            // event is only triggered when there was a transition (change in the values) caused some bugs and 
            // made the code really complicated, cause I had to handle all the conditions separately. And it still
            // needed a `setTimeout` fallback for the situations when there is no transition at all.
            // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
            //
            // If you want learn something interesting and see how it was done with `transitionend` go back to
            // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
            window.clearTimeout(stepEnterTimeout);
            stepEnterTimeout = window.setTimeout(function() {
                onStepEnter(activeStep);
            }, duration + delay);
            
            return el;
        };
        
        // `prev` API function goes to previous step (in document order)
        var prev = function () {
            var prev = steps.indexOf( activeStep ) - 1;
            prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];
            
            return goto(prev, undefined, "prev");
        };
        
        // `next` API function goes to next step (in document order)
        var next = function () {
            var next = steps.indexOf( activeStep ) + 1;
            next = next < steps.length ? steps[ next ] : steps[ 0 ];
            
            return goto(next, undefined, "next");
        };
        
        // Swipe for touch devices by @and3rson.
        // Below we extend the api to control the animation between the currently
        // active step and a presumed next/prev step. See touch plugin for
        // an example of using this api.
        
        // Helper function
        var interpolate = function(a, b, k) {
            return a + (b - a) * k;
        };
    
        // Animate a swipe. 
        //
        // pct is a value between -1.0 and +1.0, designating the current length
        // of the swipe.
        //
        // If pct is negative, swipe towards the next() step, if positive, 
        // towards the prev() step. 
        //
        // Note that pre-stepleave plugins such as goto can mess with what is a 
        // next() and prev() step, so we need to trigger the pre-stepleave event 
        // here, even if a swipe doesn't guarantee that the transition will
        // actually happen.
        //
        // Calling swipe(), with any value of pct, won't in itself cause a
        // transition to happen, this is just to animate the swipe. Once the
        // transition is committed - such as at a touchend event - caller is
        // responsible for also calling prev()/next() as appropriate.
        var swipe = function(pct){
            if( Math.abs(pct) > 1 ) return;
            // Prepare & execute the preStepLeave event
            var event = { target: activeStep, detail : {} };
            // Will be ignored within swipe animation, but just in case a plugin wants to read this, humor them
            event.detail.transitionDuration = config.transitionDuration;
            if (pct < 0) {
                var idx = steps.indexOf(activeStep) + 1;
                event.detail.next = idx < steps.length ? steps[idx] : steps[0];
                event.detail.reason = "next";
            } else if (pct > 0) {
                var idx = steps.indexOf(activeStep) - 1;
                event.detail.next = idx >= 0 ? steps[idx] : steps[steps.length - 1];
                event.detail.reason = "prev";
            } else {
                // No move
                return;
            }
            execPreStepLeavePlugins(event);
            var nextElement = event.detail.next;
            
            var nextStep = stepsData['impress-' + nextElement.id];
            var zoomin = nextStep.scale >= currentState.scale;
            // if the same step is re-selected, force computing window scaling,
            var nextScale = nextStep.scale * windowScale;
            var k = Math.abs(pct);

            var interpolatedStep = {
                translate: {
                    x: interpolate(currentState.translate.x, -nextStep.translate.x, k),
                    y: interpolate(currentState.translate.y, -nextStep.translate.y, k),
                    z: interpolate(currentState.translate.z, -nextStep.translate.z, k)
                },
                rotate: {
                    x: interpolate(currentState.rotate.x, -nextStep.rotate.x, k),
                    y: interpolate(currentState.rotate.y, -nextStep.rotate.y, k),
                    z: interpolate(currentState.rotate.z, -nextStep.rotate.z, k),
                    // Unfortunately there's a discontinuity if rotation order changes. Nothing I can do about it?
                    order: k < 0.7 ? currentState.rotate.order : nextStep.rotate.order
                },
                scale: interpolate(currentState.scale, nextScale, k)
            };

            css(root, {
                // to keep the perspective look similar for different scales
                // we need to 'scale' the perspective, too
                transform: perspective(config.perspective / interpolatedStep.scale) + scale(interpolatedStep.scale),
                transitionDuration: "0ms",
                transitionDelay: "0ms"
            });

            css(canvas, {
                transform: rotate(interpolatedStep.rotate, true) + translate(interpolatedStep.translate),
                transitionDuration: "0ms",
                transitionDelay: "0ms"
            });
        };
        
        // Teardown impress
        // Resets the DOM to the state it was before impress().init() was called.
        // (If you called impress(rootId).init() for multiple different rootId's, then you must
        // also call tear() once for each of them.)
        var tear = function() {
            lib.gc.teardown();
            delete roots[ "impress-root-" + rootId ];
        }


        // Adding some useful classes to step elements.
        //
        // All the steps that have not been shown yet are given `future` class.
        // When the step is entered the `future` class is removed and the `present`
        // class is given. When the step is left `present` class is replaced with
        // `past` class.
        //
        // So every step element is always in one of three possible states:
        // `future`, `present` and `past`.
        //
        // There classes can be used in CSS to style different types of steps.
        // For example the `present` class can be used to trigger some custom
        // animations when step is shown.
        lib.gc.addEventListener(root, "impress:init", function(){
            // STEP CLASSES
            steps.forEach(function (step) {
                step.classList.add("future");
            });
            
            lib.gc.addEventListener(root, "impress:stepenter", function (event) {
                event.target.classList.remove("past");
                event.target.classList.remove("future");
                event.target.classList.add("present");
            }, false);
            
            lib.gc.addEventListener(root, "impress:stepleave", function (event) {
                event.target.classList.remove("present");
                event.target.classList.add("past");
            }, false);
            
        }, false);
        
        // Adding hash change support.
        lib.gc.addEventListener(root, "impress:init", function(){
            
            // last hash detected
            var lastHash = "";
            
            // `#/step-id` is used instead of `#step-id` to prevent default browser
            // scrolling to element in hash.
            //
            // And it has to be set after animation finishes, because in Chrome it
            // makes transtion laggy.
            // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
            lib.gc.addEventListener(root, "impress:stepenter", function (event) {
                window.location.hash = lastHash = "#/" + event.target.id;
            }, false);
            
            lib.gc.addEventListener(window, "hashchange", function () {
                // When the step is entered hash in the location is updated
                // (just few lines above from here), so the hash change is 
                // triggered and we would call `goto` again on the same element.
                //
                // To avoid this we store last entered hash and compare.
                if (window.location.hash !== lastHash) {
                    goto( getElementFromHash() );
                }
            }, false);
            
            // START 
            // by selecting step defined in url or first step of the presentation
            goto(getElementFromHash() || steps[0], 0);
        }, false);
        
        body.classList.add("impress-disabled");
        
        // store and return API for given impress.js root element
        return (roots[ "impress-root-" + rootId ] = {
            init: init,
            goto: goto,
            next: next,
            prev: prev,
            swipe: swipe,
            tear: tear,
            lib: lib
        });

    };
    
    // flag that can be used in JS to check if browser have passed the support test
    impress.supported = impressSupported;
    
    // ADD and INIT LIBRARIES
    // Library factories are defined in src/lib/*.js, and register themselves by calling
    // impress.addLibraryFactory(libraryFactoryObject). They're stored here, and used to augment
    // the API with library functions when client calls impress(rootId).
    // See src/lib/README.md for clearer example.
    // (Advanced usage: For different values of rootId, a different instance of the libaries are
    // generated, in case they need to hold different state for different root elements.)
    var libraryFactories = {};
    impress.addLibraryFactory = function(obj){
        for (var libname in obj) {
            libraryFactories[libname] = obj[libname];
        }
    };
    // Call each library factory, and return the lib object that is added to the api.
    var initLibraries = function(rootId){
        var lib = {}
        for (var libname in libraryFactories) {
            if(lib[libname] !== undefined) {
                console.log("impress.js ERROR: Two libraries both tried to use libname: " + libname);
                return "error";
            }
            lib[libname] = libraryFactories[libname](rootId);
        }
        return lib;
    };

    // `addPreInitPlugin` allows plugins to register a function that should
    // be run (synchronously) at the beginning of init, before 
    // impress().init() itself executes.
    impress.addPreInitPlugin = function( plugin, weight ) {
        weight = toNumber(weight,10);
        if ( preInitPlugins[weight] === undefined ) {
            preInitPlugins[weight] = [];
        }
        preInitPlugins[weight].push( plugin );
    };
    
    // Called at beginning of init, to execute all pre-init plugins.
    var execPreInitPlugins = function(root) {
        for( var i = 0; i < preInitPlugins.length; i++ ) {
            var thisLevel = preInitPlugins[i];
            if( thisLevel !== undefined ) {
                for( var j = 0; j < thisLevel.length; j++ ) {
                    thisLevel[j](root);
                }
            }
        }
    };
    
    // `addPreStepLeavePlugin` allows plugins to register a function that should
    // be run (synchronously) at the beginning of goto()
    impress.addPreStepLeavePlugin = function( plugin, weight ) {
        weight = toNumber(weight,10);
        if ( preStepLeavePlugins[weight] === undefined ) {
            preStepLeavePlugins[weight] = [];
        }
        preStepLeavePlugins[weight].push( plugin );
    };
    
    // Called at beginning of goto(), to execute all preStepLeave plugins.
    var execPreStepLeavePlugins = function(event) {
        for( var i = 0; i < preStepLeavePlugins.length; i++ ) {
            var thisLevel = preStepLeavePlugins[i];
            if( thisLevel !== undefined ) {
                for( var j = 0; j < thisLevel.length; j++ ) {
                    thisLevel[j](event);
                }
            }
        }
    };

})(document, window);


// THAT'S ALL FOLKS!
//
// Thanks for reading it all.
// Or thanks for scrolling down and reading the last part.
//
// I've learnt a lot when building impress.js and I hope this code and comments
// will help somebody learn at least some part of it.

/**
 * Garbage collection utility
 *
 * This library allows plugins to add elements and event listeners they add to the DOM. The user
 * can call `impress().lib.gc.teardown()` to cause all of them to be removed from DOM, so that
 * the document is in the state it was before calling `impress().init()`.
 *
 * In addition to just adding elements and event listeners to the garbage collector, plugins
 * can also register callback functions to do arbitrary cleanup upon teardown.
 *
 * Henrik Ingo (c) 2016
 * MIT License
 */
(function ( document, window ) {
    'use strict';
    var roots = [];
    var rootsCount = 0;
    var startingState = { roots : [] };
    
    var libraryFactory = function(rootId) {
        if (roots[rootId]) {
            return roots[rootId];
        }
        
        // Per root global variables (instance variables?)
        var elementList = [];
        var eventListenerList = [];
        var callbackList = [];
        
        recordStartingState(rootId);
        
        // LIBRARY FUNCTIONS
        // Below are definitions of the library functions we return at the end
        var pushElement = function ( element ) {
            elementList.push(element);
        };
        
        // Convenience wrapper that combines DOM appendChild with gc.pushElement
        var appendChild = function ( parent, element ) {
            parent.appendChild(element);
            pushElement(element);
        };
        
        var pushEventListener = function ( target, type, listenerFunction ) {
            eventListenerList.push( {target:target, type:type, listener:listenerFunction} );
        };
        
        // Convenience wrapper that combines DOM addEventListener with gc.pushEventListener
        var addEventListener = function ( target, type, listenerFunction ) {
            target.addEventListener( type, listenerFunction );
            pushEventListener( target, type, listenerFunction );
        };
        
        // If the above utilities are not enough, plugins can add their own callback function
        // to do arbitrary things.
        var addCallback = function ( callback ) {
            callbackList.push(callback);
        };
        addCallback(function(rootId){ resetStartingState(rootId)} );
        
        var teardown = function () {
            // Execute the callbacks in LIFO order
            for ( var i = callbackList.length-1; i >= 0; i-- ) {
                callbackList[i](rootId);
            }
            callbackList = [];
            for ( var i in elementList ) {
                elementList[i].parentElement.removeChild(elementList[i]);
            }
            elementList = [];
            for ( var i in eventListenerList ) {
                var target   = eventListenerList[i].target;
                var type     = eventListenerList[i].type;
                var listener = eventListenerList[i].listener;
                target.removeEventListener(type, listener);
            }
        };
        
        var lib = {
            pushElement: pushElement,
            appendChild: appendChild,
            pushEventListener: pushEventListener,
            addEventListener: addEventListener,
            addCallback: addCallback,
            teardown: teardown
        }
        roots[rootId] = lib;
        rootsCount++;
        return lib;
    };
    
    // Let impress core know about the existence of this library
    window.impress.addLibraryFactory( { gc : libraryFactory } );
    
    
    // CORE INIT
    // The library factory (gc(rootId)) is called at the beginning of impress(rootId).init()
    // For the purposes of teardown(), we can use this as an opportunity to save the state
    // of a few things in the DOM in their virgin state, before impress().init() did anything.
    // Note: These could also be recorded by the code in impress.js core as these values
    // are changed, but in an effort to not deviate too much from upstream, I'm adding
    // them here rather than the core itself.
    var recordStartingState = function(rootId) {
        startingState.roots[rootId] = {};
        startingState.roots[rootId].steps = [];

        // Record whether the steps have an id or not
        var steps = document.getElementById(rootId).querySelectorAll(".step");
        for ( var i = 0; i < steps.length; i++ ) {
            var el = steps[i];
            startingState.roots[rootId].steps.push({
                el: el,
                id: el.getAttribute("id")
            });
        }
        
        // In the rare case of multiple roots, the following is changed on first init() and
        // reset at last tear().
        if ( rootsCount == 0 ) {
            startingState.body = {};
            // It is customary for authors to set body.class="impress-not-supported" as a starting
            // value, which can then be removed by impress().init(). But it is not required.
            // Remember whether it was there or not.
            if ( document.body.classList.contains("impress-not-supported") ) {
                startingState.body.impressNotSupported = true;
            }
            else {
                startingState.body.impressNotSupported = false;
            }
            // If there's a <meta name="viewport"> element, its contents will be overwritten by init
            var metas = document.head.querySelectorAll("meta");
            for (var i = 0; i < metas.length; i++){
                var m = metas[i];
                if( m.name == "viewport" ) {
                    startingState.meta = m.content;
                }
            };
        }
    };
    
    // CORE TEARDOWN
    var resetStartingState = function(rootId) {
        // Reset body element
        document.body.classList.remove("impress-enabled");
        document.body.classList.remove("impress-disabled");
        
        var root = document.getElementById(rootId);
        var activeId = root.querySelector(".active").id;
        document.body.classList.remove("impress-on-" + activeId);
        
        document.documentElement.style["height"] = '';
        document.body.style["height"] = '';
        document.body.style["overflow"] = '';
        // Remove style values from the root and step elements
        // Note: We remove the ones set by impress.js core. Otoh, we didn't preserve any original
        // values. A more sophisticated implementation could keep track of original values and then
        // reset those.
        var steps = root.querySelectorAll(".step");
        for( var i=0; i < steps.length; i++ ){
            steps[i].classList.remove("future");
            steps[i].classList.remove("past");
            steps[i].classList.remove("present");
            steps[i].classList.remove("active");
            steps[i].style["position"] = '';
            steps[i].style["transform"] = '';
            steps[i].style["transform-style"] = '';
        }
        root.style["position"] = '';
        root.style["transform-origin"] = '';
        root.style["transition"] = '';
        root.style["transform-style"] = '';
        root.style["top"] = '';
        root.style["left"] = '';
        root.style["transform"] = '';

        // Reset id of steps ("step-1" id's are auto generated)
        var steps = startingState.roots[rootId].steps;
        var step;
        while( step = steps.pop() ){
            if( step.id === null ) {
                step.el.removeAttribute( "id" );
            }
            else {
                step.el.setAttribute( "id", step.id );
            }
        }
        delete startingState.roots[rootId];

        // Move step div elements away from canvas, then delete canvas
        // Note: There's an implicit assumption here that the canvas div is the only child element
        // of the root div. If there would be something else, it's gonna be lost.
        var canvas = root.firstChild;
        var canvasHTML = canvas.innerHTML;
        root.innerHTML = canvasHTML;
        
        if( roots[rootId] !== undefined ) {
            delete roots[rootId];
            rootsCount--;
        }
        if( rootsCount == 0 ) {
            // In the rare case that more than one impress root elements were initialized, these
            // are only reset when all are uninitialized.
            document.body.classList.remove("impress-supported");
            if (startingState.body.impressNotSupported) {
                document.body.classList.add("impress-not-supported");
            };
            
            // We need to remove or reset the meta element inserted by impress.js
            var meta = null;
            var metas = document.head.querySelectorAll("meta");
            for (var i = 0; i < metas.length; i++){
                var m = metas[i];
                if( m.name == "viewport" ) {
                    if ( startingState.meta !== undefined ) {
                        m.content = startingState.meta;
                    }
                    else {
                        m.parentElement.removeChild(m);
                    }
                }
            }
        }
        
        
    };

    
})(document, window);

/**
 * Autoplay plugin - Automatically advance slideshow after N seconds
 *
 * Copyright 2016 Henrik Ingo, henrik.ingo@avoinelama.fi
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var autoplayDefault=0;
    var currentStepTimeout=0;
    var api = null;
    var timeoutHandle = null;
    var root = null;

    // Copied from core impress.js. Good candidate for moving to a utilities collection.
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    // On impress:init, check whether there is a default setting, as well as 
    // handle step-1.
    document.addEventListener("impress:init", function (event) {
        // Getting API from event data instead of global impress().init().
        // You don't even need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you 
        // need to control the presentation that was just initialized.
        api = event.detail.api;
        root = event.target;
        // Element attributes starting with 'data-', become available under
        // element.dataset. In addition hyphenized words become camelCased.
        var data = root.dataset;
        
        if (data.autoplay) {
            autoplayDefault = toNumber(data.autoplay, 0);
        }


        var toolbar = document.querySelector("#impress-toolbar");
        if (toolbar) {
            addToolbarButton(toolbar);
        }
        
        api.lib.gc.addCallback( function(rootId){
            clearTimeout(timeoutHandle);
        });
        // Note that right after impress:init event, also impress:stepenter is
        // triggered for the first slide, so that's where code flow continues.
    }, false);
        
    // If default autoplay time was defined in the presentation root, or
    // in this step, set timeout.
    document.addEventListener("impress:stepenter", function (event) {
        var step = event.target;
        currentStepTimeout = toNumber( step.dataset.autoplay, autoplayDefault );
        if (status=="paused") {
            setAutoplayTimeout(0);
        }
        else {
            setAutoplayTimeout(currentStepTimeout);
        }
    }, false);

    /**
     * Set timeout after which we move to next() step.
     */
    var setAutoplayTimeout = function(timeout) {
        if ( timeoutHandle ) {
            clearTimeout(timeoutHandle);
        }
   
        if ( timeout > 0) {
            timeoutHandle = setTimeout( function() { api.next(); }, timeout*1000 );
        }
        setButtonText();
    };
    

    /*** Toolbar plugin integration *******************************************/
    var status = "not clicked";
    var toolbarButton = null;

    // Copied from core impress.js. Good candidate for moving to a utilities collection.
    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    var makeDomElement = function ( html ) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.firstChild;
    };

    var toggleStatus = function() {
        if (currentStepTimeout>0 && status!="paused") {
            status="paused";
        }
        else {
            status="playing";
        }
    }

    var getButtonText = function() {
        if (currentStepTimeout>0 && status!="paused") {
            return "||"; // pause
        }
        else {
            return "&#9654;"; // play
        }
    };
    
    var setButtonText = function() {
        if (toolbarButton) {
            // Keep button size the same even if label content is changing
            var buttonWidth = toolbarButton.offsetWidth;
            var buttonHeight = toolbarButton.offsetHeight;
            toolbarButton.innerHTML = getButtonText();
            if (!toolbarButton.style.width)
                toolbarButton.style.width = buttonWidth + "px";
            if (!toolbarButton.style.height)
                toolbarButton.style.height = buttonHeight + "px";
        }
    };

    var addToolbarButton = function (toolbar) {
        var html = '<button id="impress-autoplay-playpause" title="Autoplay" class="impress-autoplay">' + getButtonText() + '</button>';
        toolbarButton = makeDomElement( html );
        toolbarButton.addEventListener( "click", function( event ) {
            toggleStatus();
            if (status=="playing") {
                if (autoplayDefault == 0) {
                    autoplayDefault = 7;
                }
                if ( currentStepTimeout == 0 ) {
                    currentStepTimeout = autoplayDefault;
                }
                setAutoplayTimeout(currentStepTimeout);
            }
            else if (status=="paused") {
                setAutoplayTimeout(0);
            }
        });

        triggerEvent(toolbar, "impress:toolbar:appendChild", { group : 10, element : toolbarButton } );
    };

})(document, window);

/**
 * Blackout plugin
 *
 * Press Ctrl+b to hide all slides, and Ctrl+b again to show them.
 * Also navigating to a different slide will show them again (impress:stepleave).
 * 
 * Copyright 2014 @Strikeskids
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';
    
    var canvas = null;
    var blackedOut = false;
    
    // While waiting for a shared library of utilities, copying these 2 from main impress.js
    var css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    };

    var pfx = (function () {
        
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                
                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            
            }
            
            return memory[ prop ];
        };
    
    })();
    


    var removeBlackout = function() {
        if (blackedOut) {
            css(canvas, {
                display: 'block'
            });
            blackedOut = false;
        }
    }

    var blackout = function() {
        if (blackedOut) {
            removeBlackout();
        }
        else {
            css(canvas, {
                display: (blackedOut = !blackedOut) ? 'none' : 'block'
            });
            blackedOut = true;
        }
    }

    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        var api = event.detail.api;
        var root = event.target;
        canvas = root.firstElementChild;
        var gc = api.lib.gc;
        
        gc.addEventListener(document, "keydown", function ( event ) {
            if ( event.ctrlKey && event.keyCode === 66 ) {
                event.preventDefault();
                if (!blackedOut) {
                    blackout();
                }
                else {
                    // Note: This doesn't work on Firefox. It will set display:block,
                    // but slides only become visible again upon next transition, which
                    // forces some kind of redraw. Works as intended on Chrome.
                    removeBlackout();
                }
            }
        }, false);
        
        gc.addEventListener(document, "keyup", function ( event ) {
            if ( event.ctrlKey && event.keyCode === 66 ) {
                event.preventDefault();
            }
        }, false);

    }, false);
        
    document.addEventListener("impress:stepleave", function (event) {
        removeBlackout();
    }, false);

})(document, window);


/**
 * Extras Plugin
 *
 * This plugin performs initialization (like calling impressConsole.init())
 * for the extras/ plugins if they are loaded into a presentation.
 *
 * See README.md for details.
 *
 * This plugin is both a pre-init plugin and an init plugin. Markdown translation
 * must be done before impress:init, otoh impressConsole.init() must be called
 * after. For other plugins it doesn't matter, but we init them in the pre-init
 * phase by default.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };



    var preInit = function() {
        if( window.markdown ){
            // Unlike the other extras, Markdown.js doesn't by default do anything in
            // particular. We do it ourselves here. In addition, we use "-----" as a delimiter for new slide.

            // Query all .markdown elements and translate to HTML
            var markdownDivs = document.querySelectorAll(".markdown");
            for (var idx=0; idx < markdownDivs.length; idx++) {
              var element = markdownDivs[idx];

              // Note: unlike the previous two, markdown.js doesn't automatically find or convert anything in 
              var slides = element.textContent.split(/^-----$/m);
              var i = slides.length - 1;
              element.innerHTML = markdown.toHTML(slides[i]);
              // If there's an id, unset it for last, and all other, elements, and then set it for the first.
              if( element.id ){
                var id = element.id;
                element.id = "";
              }
              i--;
              while (i >= 0){
                var newElement = element.cloneNode(false);
                newElement.innerHTML = markdown.toHTML(slides[i]);
                element.parentNode.insertBefore(newElement, element);
                element = newElement;
                i--;
              }
              element.id = id;
            }
        } // markdown
        
        if(window.hljs){
            hljs.initHighlightingOnLoad();        
        }
        
        if(window.mermaid){
            mermaid.initialize({startOnLoad:true});
        }
    };

    var postInit = function(event){
        if(window.impressConsole){
            // Init impressConsole.js.
            // This does not yet show the window, just activates the plugin. 
            // Press 'P' to show the console.
            // Note that we must pass the correct path to css file as well.
            // See https://github.com/regebro/impress-console/issues/19
            if(window.impressConsoleCss){
                impressConsole().init(window.impressConsoleCss);
            }
            else{
                impressConsole().init();
            }
            
            // Add 'P' to the help popup
            triggerEvent(document, "impress:help:add", { command : "P", text : "Presenter console", row : 10} );

            // Legacy impressConsole attribute (that breaks our namespace
            // convention) to open the console at start of presentation.
            // TODO: This kind of thing would in any case be better placed
            // inside impressConsole itself.
            // See https://github.com/regebro/impress-console/issues/19
            var impressattrs = document.getElementById('impress').attributes;
            if (impressattrs.hasOwnProperty('auto-console') && impressattrs['auto-console'].value.toLowerCase() === 'true') {
                consoleWindow = impressConsole().open();
            }
        }
    };

    // Register the plugin to be called in pre-init phase
    // Note: Markdown.js should run early/first, because it creates new div elements.
    // So add this with a lower-than-default weight.
    impress.addPreInitPlugin( preInit, 0 );

    // Register the plugin to be called on impress:init event
    document.addEventListener("impress:init", postInit, false);

})(document, window);


/**
 * Form support
 *
 * Functionality to better support use of input, textarea, button... elements in a presentation.
 *
 * Currently this does only one single thing: On impress:stepleave, de-focus any potentially active element.
 * This is to prevent the focus from being left in a form element that is no longer visible in the window, and
 * user therefore typing garbage into the form.
 *
 * TODO: Currently it is not possible to use TAB to navigate between form elements. Impress.js, and in particular the
 * navigation plugin, unfortunately must fully take control of the tab key, otherwise a user could cause
 * the browser to scroll to a link or button that's not on the current step. However, it could be possible to allow
 * tab navigation between form elements, as long as they are on the active step. This is a topic for further study.
 *
 * Copyright 2016 Henrik Ingo
 * MIT License
 */
(function ( document, window ) {
    'use strict';
    
    document.addEventListener("impress:stepleave", function (event) {
        document.activeElement.blur()
    }, false);
        
})(document, window);


/**
 * Goto Plugin
 *
 * The goto plugin is a pre-stepleave plugin. It is executed before impress:stepleave,
 * and will alter the destination where to transition next.
 *
 * Example:
 * 
 *         <!-- When leaving this step, go directly to "step-5" -->
 *         <div class="step" data-goto="step-5">
 * 
 *         <!-- When leaving this step with next(), go directly to "step-5", instead of the next step.
 *              If moving backwards to previous step - e.g. prev() instead of next() - then go to "step-1". -->
 *         <div class="step" data-goto-next="step-5" data-goto-prev="step-1">
 * 
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

            
    var goto = function(event) {
        if ( (!event) || (!event.target) )
            return;
        
        var data = event.target.dataset;
        var steps = document.querySelectorAll(".step");
        
        // Handle event.target data-goto-next attribute
        if ( !isNaN(data.gotoNext) && event.detail.reason == "next" ) {
            event.detail.next = steps[data.gotoNext];
            // If the new next element has its own transitionDuration, we're responsible for setting that on the event as well
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.gotoNext && event.detail.reason == "next" ) {
            var newTarget = document.getElementById( data.gotoNext );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.gotoNext + " is not a step in this impress presentation.");
            }
        }

        // Handle event.target data-goto-prev attribute
        if ( !isNaN(data.gotoPrev) && event.detail.reason == "prev" ) {
            event.detail.next = steps[data.gotoPrev];
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.gotoPrev && event.detail.reason == "prev" ) {
            var newTarget = document.getElementById( data.gotoPrev );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.gotoPrev + " is not a step in this impress presentation.");
            }
        }

        // Handle event.target data-goto attribute
        if ( !isNaN(data.goto) ) {
            event.detail.next = steps[data.goto];
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
            return;
        }
        if ( data.goto ) {
            var newTarget = document.getElementById( data.goto );
            if ( newTarget && newTarget.classList.contains("step") ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
                return;
            }
            else {
                console.log( "impress goto plugin: " + data.goto + " is not a step in this impress presentation.");
            }
        }
    };
    
    // Register the plugin to be called in pre-stepleave phase
    impress.addPreStepLeavePlugin( goto );
    
})(document, window);


/**
 * Help popup plugin
 *
 * Example:
 * 
 *     <!-- Show a help popup at start, or if user presses 'H' -->
 *     <div id="impress-help"></div>
 *
 * For developers:
 *
 * Typical use for this plugin, is for plugins that support some keypress, to add a line
 * to the help popup produced by this plugin. For example "P: Presenter console".
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';
    var rows = [];
    var timeoutHandle;

    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    var renderHelpDiv = function( e ){
        var helpDiv = document.getElementById("impress-help");
        if(helpDiv){
            var html = [];
            for( var row in rows ){
                for( var arrayItem in row ){
                    html.push(rows[row][arrayItem]);
                }
            }
            if( html ) {
                helpDiv.innerHTML = "<table>\n" + html.join("\n") + "</table>\n";
            }
        }
    };
    
    var toggleHelp = function() {
        var helpDiv = document.getElementById("impress-help");
        if(helpDiv.style.display == 'block') {
            helpDiv.style.display = 'none';
        }
        else {
            helpDiv.style.display = 'block';
            clearTimeout( timeoutHandle );
        }
    };

    document.addEventListener("keyup", function ( event ) {
        // Check that event target is html or body element.
        if ( event.target.nodeName == "BODY" || event.target.nodeName == "HTML" ) {
            if ( event.keyCode == 72 ) { // 'h'
                event.preventDefault();
                toggleHelp();
            }
        }
    }, false);

    // API
    // Other plugins can add help texts, typically if they support an action on a keypress.
    /**
     * Add a help text to the help popup.
     *
     * :param: e.detail.command  Example: "H"
     * :param: e.detail.text     Example: "Show this help."
     * :param: e.detail.row      Row index from 0 to 9 where to place this help text. Example: 0
     */
    document.addEventListener("impress:help:add", function( e ){
        // The idea is for the sender of the event to supply a unique row index, used for sorting.
        // But just in case two plugins would ever use the same row index, we wrap each row into
        // its own array. If there are more than one entry for the same index, they are shown in
        // first come, first serve ordering.
        var rowIndex = e.detail.row;
        if ( typeof rows[rowIndex] != 'object' || !rows[rowIndex].isArray ) {
            rows[rowIndex] = [];
        }
        rows[e.detail.row].push( "<tr><td><strong>" + e.detail.command + "</strong></td><td>" + e.detail.text + "</td></tr>" );
        renderHelpDiv();
    });

    document.addEventListener("impress:init", function( e ){
        renderHelpDiv();
        // At start, show the help for 7 seconds.
        var helpDiv = document.getElementById("impress-help");
        if( helpDiv ) {
            helpDiv.style.display = "block";
            timeoutHandle = setTimeout(function () {
                var helpDiv = window.document.getElementById("impress-help");
                helpDiv.style.display = "none";
            }, 7000);
            // Regster callback to empty the help div on teardown
            var api = e.detail.api;
            api.lib.gc.addCallback( function(){
                clearTimeout(timeoutHandle);
                helpDiv.style.display = '';
                helpDiv.innerHTML = '';
                rows = [];
            });
        }
        // Use our own API to register the help text for 'h'
        triggerEvent(document, "impress:help:add", { command : "H", text : "Show this help", row : 0} );
    });
    
    
})(document, window);


/**
 * Mobile devices support
 *
 * Allow presentation creators to hide all but 3 slides, to save resources, particularly on mobile devices,
 * using classes body.impress-mobile, .step.prev, .step.active and .step.next.
 *
 * Note: This plugin does not take into account possible redirections done with skip, goto etc plugins.
 * Basically it wouldn't work as intended in such cases, but the active step will at least be correct.
 *
 * Adapted to a plugin from a submission by @Kzeni:
 * https://github.com/impress/impress.js/issues/333
 */
(function ( document, window ) {
    'use strict';

    var getNextStep = function( el ){
        var steps = document.querySelectorAll(".step");
        for( var i = 0; i < steps.length; i++ ) {
            if( steps[i] == el )
                if( i+1 < steps.length )
                    return steps[i+1];
                else
                    return steps[0];
        }
    };
    var getPrevStep = function( el ){
        var steps = document.querySelectorAll(".step");
        for( var i = steps.length-1; i >= 0; i-- ) {
            if( steps[i] == el ){
                if( i-1 >= 0 ) {
                    return steps[i-1];
                }
                else {
                    return steps[steps.length-1];
                }
            }
        }
    };

    // Detect mobile browsers & add CSS class as appropriate.
    document.addEventListener("impress:init", function (event) {
        var body = document.body;
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){ 
            body.classList.add('impress-mobile');
        }
        // Unset all this on teardown
        var api = event.detail.api;
        api.lib.gc.addCallback( function(){
            document.body.classList.remove("impress-mobile");
            var prev = document.getElementsByClassName('prev')[0];
            var next = document.getElementsByClassName('next')[0];
            if(typeof prev != 'undefined')
                prev.classList.remove('prev');
            if(typeof next != 'undefined')
                next.classList.remove('next');
        });
    });

    // Add prev and next classes to the siblings of the newly entered active step element
    // Remove prev and next classes from their current step elements
    // Note: As an exception we break namespacing rules, as these are useful general purpose classes.
    // (Naming rules would require us to use css classes mobile-next and mobile-prev, based on plugin name.)
    document.addEventListener('impress:stepenter',function(event){
	      var oldprev = document.getElementsByClassName('prev')[0];
	      var oldnext = document.getElementsByClassName('next')[0];

	      var prev = getPrevStep(event.target);
	      prev.classList.add('prev');
	      var next = getNextStep(event.target);
	      next.classList.add('next');

	      if(typeof oldprev != 'undefined')
		      oldprev.classList.remove('prev');
	      if(typeof oldnext != 'undefined')
		      oldnext.classList.remove('next');
    });
})(document, window);


/**
 * Mouse timeout plugin
 *
 * After 3 seconds of mouse inactivity, add the css class 
 * `body.impress-mouse-timeout`. On `mousemove`, `click` or `touch`, remove the
 * class.
 *
 * The use case for this plugin is to use CSS to hide elements from the screen
 * and only make them visible when the mouse is moved. Examples where this
 * might be used are: the toolbar from the toolbar plugin, and the mouse cursor
 * itself.
 *
 * Example CSS:
 *
 *     body.impress-mouse-timeout {
 *         cursor: none;
 *     }
 *     body.impress-mouse-timeout div#impress-toolbar {
 *         display: none;
 *     }
 *
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';
    var timeout = 3;
    var timeoutHandle;

    var hide = function(){
        // Mouse is now inactive
        document.body.classList.add("impress-mouse-timeout");
    };

    var show = function(){
        if ( timeoutHandle ) {
            clearTimeout(timeoutHandle);
        }
        // Mouse is now active
        document.body.classList.remove("impress-mouse-timeout");
        // Then set new timeout after which it is considered inactive again
        timeoutHandle = setTimeout( hide, timeout*1000 );
    };

    document.addEventListener("impress:init", function (event) {
        var api = event.detail.api;
        var gc = api.lib.gc;
        gc.addEventListener(document, "mousemove", show);
        gc.addEventListener(document, "click", show);
        gc.addEventListener(document, "touch", show);
        // Set first timeout
        show();
        // Unset all this on teardown
        gc.addCallback( function(){
            clearTimeout(timeoutHandle);
            document.body.classList.remove("impress-mouse-timeout");
        });
    }, false);

})(document, window);

/**
 * Navigation events plugin
 *
 * As you can see this part is separate from the impress.js core code.
 * It's because these navigation actions only need what impress.js provides with
 * its simple API.
 *
 * This plugin is what we call an _init plugin_. It's a simple kind of
 * impress.js plugin. When loaded, it starts listening to the `impress:init`
 * event. That event listener initializes the plugin functionality - in this
 * case we listen to some keypress and mouse events. The only dependencies on
 * core impress.js functionality is the `impress:init` method, as well as using
 * the public api `next(), prev(),` etc when keys are pressed.
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Released under the MIT license.
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 *
 */
(function ( document, window ) {
    'use strict';
    
    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you 
        // need to control the presentation that was just initialized.
        var api = event.detail.api;
        var gc = api.lib.gc;
        var tab = 9;

        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        var isNavigationEvent = function (event) {
            // Don't trigger navigation for example when user returns to browser window with ALT+TAB
            if ( event.altKey || event.ctrlKey || event.metaKey ){
                return false;
            }
            
            // In the case of TAB, we force step navigation always, overriding the browser navigation between
            // input elements, buttons and links.
            if ( event.keyCode === 9 ) {
                return true;
            }
            
            // With the sole exception of TAB, we also ignore keys pressed if shift is down.
            if ( event.shiftKey ){
                return false;
            }

            // For arrows, etc, check that event target is html or body element. This is to allow presentations to have,
            // for example, forms with input elements where user can type text, including space, and not move to next step.
            if ( event.target.nodeName != "BODY" && event.target.nodeName != "HTML" ) {
                return false;
            }

            if ( ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40 ) ) {
                return true;
            }
        };
        
        
        // KEYBOARD NAVIGATION HANDLERS
        
        // Prevent default keydown action when one of supported key is pressed.
        gc.addEventListener(document, "keydown", function ( event ) {
            if ( isNavigationEvent(event) ) {
                event.preventDefault();
            }
        }, false);
        
        // Trigger impress action (next or prev) on keyup.
        gc.addEventListener(document, "keyup", function ( event ) {
            if ( isNavigationEvent(event) ) {
                if ( event.shiftKey ) {
                    switch( event.keyCode ) {
                        case 9: // shift+tab
                            api.prev();
                            break;
                    }
                }
                else {
                    switch( event.keyCode ) {
                        case 33: // pg up
                        case 37: // left
                        case 38: // up
                                 api.prev();
                                 break;
                        case 9:  // tab
                        case 32: // space
                        case 34: // pg down
                        case 39: // right
                        case 40: // down
                                 api.next();
                                 break;
                    }
                }
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on the links to presentation steps
        gc.addEventListener(document, "click", function ( event ) {
            // event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            while ( (target.tagName !== "A") &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            
            if ( target.tagName === "A" ) {
                var href = target.getAttribute("href");
                
                // if it's a link to presentation step, target this step
                if ( href && href[0] === '#' ) {
                    target = document.getElementById( href.slice(1) );
                }
            }
            
            if ( api.goto(target) ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on step elements
        gc.addEventListener(document, "click", function ( event ) {
            var target = event.target;
            // find closest step element that is not active
            while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            
            if ( api.goto(target) ) {
                event.preventDefault();
            }
        }, false);
        
        // Add a line to the help popup
        triggerEvent(document, "impress:help:add", { command : "Left &amp; Right", text : "Previous &amp; Next step", row : 1} );
        
    }, false);
        
})(document, window);


/**
 * Navigation UI plugin
 *
 * This plugin provides UI elements "back", "forward" and a list to select
 * a specific slide number.
 *
 * The navigation controls are added to the toolbar plugin via DOM events. User must enable the
 * toolbar in a presentation to have them visible.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';
    var toolbar;
    var api;
    var root;
    var steps;
    var hideSteps = [];
    var prev;
    var select;
    var next;

    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    var makeDomElement = function ( html ) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.firstChild;
    };
    
    var selectOptionsHtml = function(){
        var options = "";
        for ( var i = 0; i < steps.length; i++ ) {
            // Omit steps that are listed as hidden from select widget
            if ( hideSteps.indexOf( steps[i] ) < 0 ) {
                options = options + '<option value="' + steps[i].id + '">' + steps[i].id + '</option>' + "\n";
            }
        }
        return options;    
    };

    var addNavigationControls = function( event ) {
        api = event.detail.api;
        var gc = api.lib.gc;
        root = event.target;
        steps = root.querySelectorAll(".step");

        var prevHtml   = '<button id="impress-navigation-ui-prev" title="Previous" class="impress-navigation-ui">&lt;</button>';
        var selectHtml = '<select id="impress-navigation-ui-select" title="Go to" class="impress-navigation-ui">' + "\n"
                           + selectOptionsHtml();
                           + '</select>';
        var nextHtml   = '<button id="impress-navigation-ui-next" title="Next" class="impress-navigation-ui">&gt;</button>';

        prev = makeDomElement( prevHtml );
        prev.addEventListener( "click",
            function( event ) {
                api.prev();
        });
        select = makeDomElement( selectHtml );
        select.addEventListener( "change",
            function( event ) {
                api.goto( event.target.value );
        });
        gc.addEventListener(root, "impress:steprefresh", function(event){
            // As impress.js core now allows to dynamically edit the steps, including adding, removing,
            // and reordering steps, we need to requery and redraw the select list on every stepenter event.
            steps = root.querySelectorAll(".step");
            select.innerHTML = "\n" + selectOptionsHtml();
            // Make sure the list always shows the step we're actually on, even if it wasn't selected from the list
            select.value = event.target.id;
        });
        next = makeDomElement( nextHtml );
        next.addEventListener( "click",
            function() {
                api.next();
        });
        
        triggerEvent(toolbar, "impress:toolbar:appendChild", { group : 0, element : prev } );
        triggerEvent(toolbar, "impress:toolbar:appendChild", { group : 0, element : select } );
        triggerEvent(toolbar, "impress:toolbar:appendChild", { group : 0, element : next } );
        
    };
    
    // API for not listing given step in the select widget.
    // For example, if you set class="skip" on some element, you may not want it to show up in the list either.
    // Otoh we cannot assume that, or anything else, so steps that user wants omitted must be specifically added with this API call.
    document.addEventListener("impress:navigation-ui:hideStep", function (event) {
        hideSteps.push(event.target);
        if (select) {
            select.innerHTML = selectOptionsHtml();
        }
    }, false);
    
    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        toolbar = document.querySelector("#impress-toolbar");
        if(toolbar) {
            addNavigationControls( event );
        }
    }, false);
    
})(document, window);


(function ( document, window ) {
    'use strict';
	var root;
	var stepids = [];
	// Get stepids from the steps under impress root
	var getSteps = function(){
		stepids = [];
		var steps = root.querySelectorAll(".step");
		for (var i = 0; i < steps.length; i++)
		{
		  stepids[i+1] = steps[i].id;
		}
        }
	// wait for impress.js to be initialized
	document.addEventListener("impress:init", function (event) {
        	root = event.target;
		getSteps();
		var gc = event.detail.api.lib.gc;
		gc.addCallback( function(){
			stepids = [];
			if (progressbar) progressbar.style.width = '';
			if (progress) progress.innerHTML = '';
		});
	});

	var progressbar = document.querySelector('div.impress-progressbar div');
	var progress = document.querySelector('div.impress-progress');
	
	if (null !== progressbar || null !== progress) {      
		document.addEventListener("impress:stepleave", function (event) {
			updateProgressbar(event.detail.next.id);
		});
		
		document.addEventListener("impress:steprefresh", function (event) {
			getSteps();
			updateProgressbar(event.target.id);
		});

	}

	function updateProgressbar(slideId) {
		var slideNumber = stepids.indexOf(slideId);
		if (null !== progressbar) {
			progressbar.style.width = (100 / (stepids.length - 1) * (slideNumber)).toFixed(2) + '%';
		}
		if (null !== progress) {
			progress.innerHTML = slideNumber + '/' + (stepids.length-1);
		}
	}
})(document, window);

/**
 * Relative Positioning Plugin
 *
 * This plugin provides support for defining the coordinates of a step relative
 * to the previous step. This is often more convenient when creating presentations,
 * since as you add, remove or move steps, you may not need to edit the positions
 * as much as is the case with the absolute coordinates supported by impress.js
 * core.
 * 
 * Example:
 * 
 *         <!-- Position step 1000 px to the right and 500 px up from the previous step. -->
 *         <div class="step" data-rel-x="1000" data-rel-y="500">
 * 
 * Following html attributes are supported for step elements:
 * 
 *     data-rel-x
 *     data-rel-y
 *     data-rel-z
 * 
 * These values are also inherited from the previous step. This makes it easy to 
 * create a boring presentation where each slide shifts for example 1000px down 
 * from the previous.
 * 
 * In addition to plain numbers, which are pixel values, it is also possible to
 * define relative positions as a multiple of screen height and width, using
 * a unit of "h" and "w", respectively, appended to the number.
 * 
 * Example:
 *
 *        <div class="step" data-rel-x="1.5w" data-rel-y="1.5h">
 *
 * This plugin is a *pre-init plugin*. It is called synchronously from impress.js
 * core at the beginning of `impress().init()`. This allows it to process its own
 * data attributes first, and possibly alter the data-x, data-y and data-z attributes
 * that will then be processed by `impress().init()`.
 * 
 * (Another name for this kind of plugin might be called a *filter plugin*, but
 * *pre-init plugin* is more generic, as a plugin might do whatever it wants in
 * the pre-init stage.)
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var startingState = {};

    /**
     * Copied from core impress.js. We currently lack a library mechanism to
     * to share utility functions like this.
     */
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    /**
     * Extends toNumber() to correctly compute also relative-to-screen-size values 5w and 5h.
     *
     * Returns the computed value in pixels with w/h postfix removed.
     */
    var toNumberAdvanced = function (numeric, fallback) {
        if (!(typeof numeric == 'string')) {
            return toNumber(numeric, fallback);
        }
        var ratio = numeric.match(/^([+-]*[\d\.]+)([wh])$/);
        if (ratio == null) {
            return toNumber(numeric, fallback);
        } else {
            var value = parseFloat(ratio[1]);
            var multiplier = ratio[2] == 'w' ? window.innerWidth : window.innerHeight;
            return value * multiplier;
        }
    };

    var computeRelativePositions = function ( el, prev ) {
        var data = el.dataset;
        
        if( !prev ) {
            // For the first step, inherit these defaults
            var prev = { x:0, y:0, z:0, relative: {x:0, y:0, z:0} };
        }

        var step = {
                x: toNumber(data.x, prev.x),
                y: toNumber(data.y, prev.y),
                z: toNumber(data.z, prev.z),
                relative: {
                    x: toNumberAdvanced(data.relX, prev.relative.x),
                    y: toNumberAdvanced(data.relY, prev.relative.y),
                    z: toNumberAdvanced(data.relZ, prev.relative.z)
                }
            };
        // Relative position is ignored/zero if absolute is given.
        // Note that this also has the effect of resetting any inherited relative values.
        if(data.x !== undefined) step.relative.x = 0;
        if(data.y !== undefined) step.relative.y = 0;
        if(data.z !== undefined) step.relative.z = 0;
        
        // Apply relative position to absolute position, if non-zero
        // Note that at this point, the relative values contain a number value of pixels.
        step.x = step.x + step.relative.x;
        step.y = step.y + step.relative.y;
        step.z = step.z + step.relative.z;
        
        return step;        
    };
            
    var rel = function(root) {
        var steps = root.querySelectorAll(".step");
        var prev;
        startingState[root.id] = [];
        for ( var i = 0; i < steps.length; i++ ) {
            var el = steps[i];
            startingState[root.id].push({
                el: el,
                x: el.getAttribute("data-x"),
                y: el.getAttribute("data-y"),
                z: el.getAttribute("data-z")
            });
            var step = computeRelativePositions( el, prev );
            // Apply relative position (if non-zero)
            el.setAttribute( "data-x", step.x );
            el.setAttribute( "data-y", step.y );
            el.setAttribute( "data-z", step.z );
            prev = step;
        }
    };
    
    // Register the plugin to be called in pre-init phase
    impress.addPreInitPlugin( rel );
    
    // Register teardown callback to reset the data.x, .y, .z values.
    document.addEventListener( "impress:init", function(event) {
        var root = event.target;
        event.detail.api.lib.gc.addCallback( function(){
            var steps = startingState[root.id];
            var step;
            while( step = steps.pop() ){
                if( step.x === null ) {
                    step.el.removeAttribute( "data-x" );
                }
                else {
                    step.el.setAttribute( "data-x", step.x );
                }
                if( step.y === null ) {
                    step.el.removeAttribute( "data-y" );
                }
                else {
                    step.el.setAttribute( "data-y", step.y );
                }
                if( step.z === null ) {
                    step.el.removeAttribute( "data-z" );
                }
                else {
                    step.el.setAttribute( "data-z", step.z );
                }
            }
            delete startingState[root.id];
        });
    }, false);
})(document, window);


/**
 * Resize plugin
 *
 * Rescale the presentation after a window resize.
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Released under the MIT license.
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 *
 */
(function ( document, window ) {
    'use strict';
    
    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };
    
    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        var api = event.detail.api;
        // rescale presentation when window is resized
        api.lib.gc.addEventListener(window, "resize", throttle(function () {
            // force going to active step again, to trigger rescaling
            api.goto( document.querySelector(".step.active"), 500 );
        }, 250), false);
    }, false);
        
})(document, window);


/**
 * Skip Plugin
 *
 * Example:
 * 
 *    <!-- This slide is disabled in presentations, when moving with next()
 *         and prev() commands, but you can still move directly to it, for
 *         example with a url (anything using goto()). -->
 *         <div class="step skip">
 * 
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };

    var getNextStep = function( el ){
        var steps = document.querySelectorAll(".step");
        for( var i = 0; i < steps.length; i++ ) {
            if( steps[i] == el )
                if( i+1 < steps.length )
                    return steps[i+1];
                else
                    return steps[0];
        }
    };
    var getPrevStep = function( el ){
        var steps = document.querySelectorAll(".step");
        for( var i = steps.length-1; i >= 0; i-- ) {
            if( steps[i] == el )
                if( i-1 >= 0 )
                    return steps[i-1];
                else
                    return steps[steps.length-1];
        }
    };

    var skip = function(event) {
        if ( (!event) || (!event.target) )
            return;
        
        if ( event.detail.next.classList.contains("skip") ) {
            if ( event.detail.reason == "next" ) {
                // Go to the next next step instead
                event.detail.next = getNextStep( event.detail.next );
                // Recursively call this plugin again, until there's a step not to skip
                skip( event );
            }
            else if ( event.detail.reason == "prev" ) {
                // Go to the previous previous step instead
                event.detail.next = getPrevStep( event.detail.next );
                skip( event );
            }
            // If the new next element has its own transitionDuration, we're responsible for setting that on the event as well
            event.detail.transitionDuration = toNumber( event.detail.next.dataset.transitionDuration, event.detail.transitionDuration);
        }
    };
    
    // Register the plugin to be called in pre-stepleave phase
    // The weight makes this plugin run early. This is a good thing, because this plugin calls itself recursively.
    impress.addPreStepLeavePlugin( skip, 1 );
    
})(document, window);


/**
 * Stop Plugin
 *
 * Example:
 * 
 *        <!-- Stop at this slide.
 *             (For example, when used on the last slide, this prevents the 
 *             presentation from wrapping back to the beginning.) -->
 *        <div class="step" data-stop="true">
 * 
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';

    var stop = function(event) {
        if ( (!event) || (!event.target) )
            return;
        
        if ( event.target.classList.contains("stop") ) {
            if ( event.detail.reason == "next" )
                event.detail.next = event.target;
        }
    };
    
    // Register the plugin to be called in pre-stepleave phase
    // The weight makes this plugin run fairly late.
    impress.addPreStepLeavePlugin( stop, 20 );
    
})(document, window);


/**
 * Support for swipe and tap on touch devices
 *
 * This plugin implements navigation for plugin devices, via swiping left/right,
 * or tapping on the left/right edges of the screen.
 *
 *
 * 
 * Copyright 2015: Andrew Dunai (@and3rson)
 * Modified to a plugin, 2016: Henrik Ingo (@henrikingo) 
 *
 * MIT License
 */
(function ( document, window ) {
    'use strict';

    // Touch handler to detect swiping left and right based on window size.
    // If the difference in X change is bigger than 1/20 of the screen width,
    // we simply call an appropriate API function to complete the transition.
    var startX = 0;
    var lastX = 0;
    var lastDX = 0;
    var threshold = window.innerWidth / 20;
    
    document.addEventListener('touchstart', function (event) {
        lastX = startX = event.touches[0].clientX;
    });

    document.addEventListener('touchmove', function (event) {
         var x = event.touches[0].clientX;
         var diff = x - startX;
         // To be used in touchend
         lastDX = lastX - x;
         lastX = x;

         impress().swipe( diff / window.innerWidth );
     });

     document.addEventListener('touchend', function (event) {
         var totalDiff = lastX - startX;
         if (Math.abs(totalDiff) > window.innerWidth / 5 && (totalDiff * lastDX) <= 0) {
             if (totalDiff > window.innerWidth / 5 && lastDX <= 0) {
                 impress().prev();
             } else if (totalDiff < -window.innerWidth / 5 && lastDX >= 0) {
                 impress().next();
             }
         } else if (Math.abs(lastDX) > threshold) {
             if (lastDX < -threshold) {
                 impress().prev();
             } else if (lastDX > threshold) {
                 impress().next();
             }
         } else {
             // No movement - move (back) to the current slide
             impress().goto(document.querySelector("#impress .step.active"));
         }
     });

     document.addEventListener('touchcancel', function (event) {
             // move (back) to the current slide
             impress().goto(document.querySelector("#impress .step.active"));
     });

})(document, window);

/**
 * Toolbar plugin
 *
 * This plugin provides a generic graphical toolbar. Other plugins that
 * want to expose a button or other widget, can add those to this toolbar.
 *
 * Using a single consolidated toolbar for all GUI widgets makes it easier
 * to position and style the toolbar rather than having to do that for lots
 * of different divs.
 *
 *
 * *** For presentation authors: *****************************************
 *
 * To add/activate the toolbar in your presentation, add this div:
 *
 *     <div id="impress-toolbar"></div>
 * 
 * Styling the toolbar is left to presentation author. Here's an example CSS:
 *
 *    .impress-enabled div#impress-toolbar {
 *        position: fixed;
 *        right: 1px;
 *        bottom: 1px;
 *        opacity: 0.6;
 *    }
 *    .impress-enabled div#impress-toolbar > span {
 *        margin-right: 10px;
 *    }
 *
 * The [mouse-timeout](../mouse-timeout/README.md) plugin can be leveraged to hide
 * the toolbar from sight, and only make it visible when mouse is moved.
 *
 *    body.impress-mouse-timeout div#impress-toolbar {
 *        display: none;
 *    }
 *
 *
 * *** For plugin authors **********************************************
 *
 * To add a button to the toolbar, trigger the `impress:toolbar:appendChild`
 * or `impress:toolbar:insertBefore` events as appropriate. The detail object
 * should contain following parameters:
 *
 *    { group : 1,                       // integer. Widgets with the same group are grouped inside the same <span> element.
 *      html : "<button>Click</button>", // The html to add.
 *      callback : "mycallback",         // Toolbar plugin will trigger event `impress:toolbar:added:mycallback` when done.
 *      before: element }                // The reference element for an insertBefore() call.
 *
 * You should also listen to the `impress:toolbar:added:mycallback` event. At 
 * this point you can find the new widget in the DOM, and for example add an
 * event listener to it.
 *
 * You are free to use any integer for the group. It's ok to leave gaps. It's
 * ok to co-locate with widgets for another plugin, if you think they belong
 * together.
 *
 * See navigation-ui for an example.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
(function ( document, window ) {
    'use strict';
    var toolbar = document.getElementById("impress-toolbar");
    var groups = [];

    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };
    
    /**
     * Get the span element that is a child of toolbar, identified by index.
     *
     * If span element doesn't exist yet, it is created.
     *
     * Note: Because of Run-to-completion, this is not a race condition.
     * https://developer.mozilla.org/en/docs/Web/JavaScript/EventLoop#Run-to-completion
     *
     * :param: index   Method will return the element <span id="impress-toolbar-group-{index}">
     */
    var getGroupElement = function(index){
        var id = "impress-toolbar-group-" + index;
        if(!groups[index]){
            groups[index] = document.createElement("span");
            groups[index].id = id;
            var nextIndex = getNextGroupIndex(index);
            if ( nextIndex === undefined ){
                toolbar.appendChild(groups[index]);
            }
            else{
                toolbar.insertBefore(groups[index], groups[nextIndex]);
            }
        }
        return groups[index];
    };
    
    /**
     * Get the span element from groups[] that is immediately after given index.
     *
     * This can be used to find the reference node for an insertBefore() call.
     * If no element exists at a larger index, returns undefined. (In this case,
     * you'd use appendChild() instead.)
     *
     * Note that index needn't itself exist in groups[].
     */
    var getNextGroupIndex = function(index){
        var i = index+1;
        while( ! groups[i] && i < groups.length) {
            i++;
        }
        if( i < groups.length ){
            return i;
        }
    };

    // API
    // Other plugins can add and remove buttons by sending them as events.
    // In return, toolbar plugin will trigger events when button was added.
    if (toolbar) {
        /**
         * Append a widget inside toolbar span element identified by given group index.
         *
         * :param: e.detail.group    integer specifying the span element where widget will be placed
         * :param: e.detail.element  a dom element to add to the toolbar
         */
        toolbar.addEventListener("impress:toolbar:appendChild", function( e ){
            var group = getGroupElement(e.detail.group);
            group.appendChild(e.detail.element);
        });

        /**
         * Add a widget to toolbar using insertBefore() DOM method.
         *
         * :param: e.detail.before   the reference dom element, before which new element is added
         * :param: e.detail.element  a dom element to add to the toolbar
         */
        toolbar.addEventListener("impress:toolbar:insertBefore", function( e ){
            toolbar.insertBefore(e.detail.element, e.detail.before);
        });

        /**
         * Remove the widget in e.detail.remove.
         */
        toolbar.addEventListener("impress:toolbar:removeWidget", function( e ){
            toolbar.removeChild(e.detail.remove);
        });

        document.addEventListener("impress:init", function( event ) {
            var api = event.detail.api;
            api.lib.gc.addCallback( function() {
                toolbar.innerHTML = '';
                groups = [];
            });
        });
    } // if toolbar

})(document, window);
