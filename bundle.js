;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var raf = require('raf')
  , Boids = require('./')

var attractors = [[
    0 // x
  , 0 // y
  , 50 // dist
  , -2 // spd
]]

var canvas = document.createElement('canvas')
  , ctx = canvas.getContext('2d')
  , boids = Boids({
      boids: 200
    , speedLimit: 2
    , attractors: attractors
  }).on('tick', function(boids) {
    var halfHeight = canvas.height/2
      , halfWidth = canvas.width/2

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#fff'
    for (var i = 0, l = boids.length; i < l; i += 1) {
      ctx.fillRect(boids[i].pos[0] + halfWidth, boids[i].pos[1] + halfHeight, 5, 5)
    }
  }).once('tick', function(boids) {
    console.log(boids)
  })

document.body.onmousemove = function(e) {
  var halfHeight = canvas.height/2
      , halfWidth = canvas.width/2

  attractors[0][0] = e.x - halfWidth
  attractors[0][1] = e.y - halfHeight
  attractors[1][0] = e.x - halfWidth
  attractors[1][1] = e.y - halfHeight
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.appendChild(canvas)

raf(window).on('data', boids.tick.bind(boids))

},{"./":2,"raf":3}],3:[function(require,module,exports){
(function(){module.exports = raf

var EE = require('events').EventEmitter
  , global = typeof window === 'undefined' ? this : window
  , now = Date.now || function () { return +new Date() }

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

function raf(el) {
  var now = raf.now()
    , ee = new EE

  ee.pause = function() { ee.paused = true }
  ee.resume = function() { ee.paused = false }

  _raf(iter, el)

  return ee

  function iter(timestamp) {
    var _now = raf.now()
      , dt = _now - now
    
    now = _now

    ee.emit('data', dt)

    if(!ee.paused) {
      _raf(iter, el)
    }
  }
}

raf.polyfill = _raf
raf.now = now


})()
},{"events":4}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":5}],2:[function(require,module,exports){

var EventEmitter = require('events').EventEmitter
  , inherits = require('inherits')

module.exports = Boids

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback)
  EventEmitter.call(this)

  opts = opts || {}
  callback = callback || function(){}

  this.speedLimitRoot = opts.speedLimit || 0
  this.speedLimit = Math.pow(this.speedLimitRoot, 2)
  this.separationDistance = Math.pow(opts.separationDistance || 60, 2)
  this.cohesionDistance = Math.pow(opts.cohesionDistance || 100, 2)
  this.separationForce = opts.separationForce || 0.15
  this.cohesionForce = opts.cohesionForce || 0.15
  this.alignment = opts.alignment || 0.15
  this.attractors = opts.attractors || []

  var boids = this.boids = []
  for (var i = 0, l = opts.boids || 50; i < l; i += 1) {
    boids[i] = {
        pos: [Math.random()*25,Math.random()*25]
      , spd: [0,0]
      , acc: [0,0]
    }
  }

  this.on('tick', function() {
    callback(boids)
  })
}
inherits(Boids, EventEmitter)

Boids.prototype.tick = function() {
  var boids = this.boids
    , sepDist = this.separationDistance
    , sepForce = this.separationForce
    , cohDist = this.cohesionDistance
    , cohForce = this.cohesionForce
    , alignment = this.alignment
    , speedLimit = this.speedLimit
    , speedLimitRoot = this.speedLimitRoot
    , size = boids.length
    , current = size
    , sforce = [0,0]
    , cforce = [0,0]
    , aforce = [0,0]
    , spare = [0,0]
    , attractors = this.attractors
    , attractorCount = attractors.length
    , distSquared
    , currPos
    , targPos
    , length
    , target

  while (current--) {
    sforce[0] = 0; sforce[1] = 0
    cforce[0] = 0; cforce[1] = 0
    aforce[0] = 0; aforce[1] = 0
    currPos = boids[current].pos

    // Attractors
    target = attractorCount
    while (target--) {
      attractor = attractors[target]
      spare[0] = currPos[0] - attractor[0]
      spare[1] = currPos[1] - attractor[1]
      distSquared = spare[0]*spare[0] + spare[1]*spare[1]

      if (distSquared < attractor[2]*attractor[2]) {
        length = Math.sqrt(spare[0]*spare[0]+spare[1]*spare[1])
        boids[current].spd[0] -= (attractor[3] * spare[0] / length) || 0
        boids[current].spd[1] -= (attractor[3] * spare[1] / length) || 0
      }
    }

    target = size
    while (target--) {
      if (target === current) continue
      targPos = boids[target].pos

      spare[0] = currPos[0] - targPos[0]
      spare[1] = currPos[1] - targPos[1]
      distSquared = spare[0]*spare[0] + spare[1]*spare[1]

      if (distSquared < sepDist) {
        sforce[0] += spare[0]
        sforce[1] += spare[1]
      } else
      if (distSquared < cohDist) {
        cforce[0] += spare[0]
        cforce[1] += spare[1]
        aforce[0] += boids[target].spd[0]
        aforce[1] += boids[target].spd[1]
      }
    }

    // Separation
    length = Math.sqrt(sforce[0]*sforce[0] + sforce[1]*sforce[1])
    boids[current].spd[0] += (sepForce * sforce[0] / length) || 0
    boids[current].spd[1] += (sepForce * sforce[1] / length) || 0
    // Cohesion
    length = Math.sqrt(cforce[0]*cforce[0] + cforce[1]*cforce[1])
    boids[current].spd[0] -= (cohForce * cforce[0] / length) || 0
    boids[current].spd[1] -= (cohForce * cforce[1] / length) || 0
    // Alignment
    length = Math.sqrt(aforce[0]*aforce[0] + aforce[1]*aforce[1])
    boids[current].spd[0] -= (alignment * aforce[0] / length) || 0
    boids[current].spd[1] -= (alignment * aforce[1] / length) || 0
  }
  current = size

  // Apply speed/acceleration for
  // this tick
  while (current--) {
    if (speedLimit) {
      distSquared = boids[current].spd[0]*boids[current].spd[0] + boids[current].spd[1]*boids[current].spd[1]
      if (distSquared > speedLimit) {
        ratio = speedLimitRoot / Math.sqrt(distSquared)
        boids[current].spd[0] *= ratio
        boids[current].spd[1] *= ratio
      }
    }
    boids[current].spd[0] += boids[current].acc[0]
    boids[current].spd[1] += boids[current].acc[1]

    boids[current].pos[0] += boids[current].spd[0]
    boids[current].pos[1] += boids[current].spd[1]
  }

  this.emit('tick', boids)
}

},{"events":4,"inherits":6}],6:[function(require,module,exports){
module.exports = inherits

function inherits (c, p, proto) {
  proto = proto || {}
  var e = {}
  ;[c.prototype, proto].forEach(function (s) {
    Object.getOwnPropertyNames(s).forEach(function (k) {
      e[k] = Object.getOwnPropertyDescriptor(s, k)
    })
  })
  c.prototype = Object.create(p.prototype, e)
  c.super = p
}

//function Child () {
//  Child.super.call(this)
//  console.error([this
//                ,this.constructor
//                ,this.constructor === Child
//                ,this.constructor.super === Parent
//                ,Object.getPrototypeOf(this) === Child.prototype
//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))
//                 === Parent.prototype
//                ,this instanceof Child
//                ,this instanceof Parent])
//}
//function Parent () {}
//inherits(Child, Parent)
//new Child

},{}]},{},[1])
;