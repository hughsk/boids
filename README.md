# boids #

A lightweight JavaScript implementation of
[boids](http://en.wikipedia.org/wiki/Boids). Its "API" is a little limited,
but it's reasonably performant - my MacBook ran the demo with 1,000 boids at
60 frames per second.

[check out the demo](http://hughsk.github.io/boids)

I used an earlier, hastier version for the flocks in
[grow.](http://github.com/hughsk/ludum-dare-26)

## Installation ##

For use with [browserify](http://browserify.org):

``` bash
npm install boids
```

## Usage ##

``` javascript
var boids = require('boids')
  , raf = require('raf')

var flock = boids({
  boids: 50,              // The amount of boids to use
  speedLimit: 0,          // Max steps to take per tick
  accelerationLimit: 1,   // Max acceleration per tick
  separationDistance: 60, // Radius at which boids avoid others
  alignmentDistance: 180, // Radius at which boids align with others
  choesionDistance: 180,  // Radius at which boids approach others
  separationForce: 0.15,  // Speed to avoid at
  alignmentForce: 0.25,   // Speed to align with other boids
  choesionForce: 0.1,     // Speed to move towards other boids
  attractors: []
})

raf(window).on('data', function() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'white'
  ctx.save()
  ctx.translate(-canvas.width/2, -canvas.height/2)
  flock.tick()
  flock.boids.forEach(function(boid) {
    ctx.fillRect(boid[0], boid[1], 1, 1)
  })
  ctx.restore()
})
```

**flock = boids([options])**

**flock.tick()**

Moves the boid simulation forward one tick - if you're running an animation,
you should be calling this on each frame.

**flock.boids**

All of your boids are stored as an array of arrays, with each
array containing the following variables for a single boid:

``` javascript
[xPosition, yPosition, xSpeed, ySpeed, xAcceleration, yAcceleration]
```

Because the flock is just an array, it should be entirely safe for you
to add and remove elements without any unintended side effects, provided all
of the arrays are at least 6 elements long and contain numerical values. For
example, you can add a new boid moving at a random speed to the origin like so:

``` javascript
flock.boids.push([0, 0, Math.random()*10-5, Math.random()*10-5, 0, 0])
```

**flock.attractors**

You can use attractors to control the flow of the boids - essentially,
providing them with goals and obstacles. Each attractor contains:

``` javascript
[xPosition, yPosition, radius, force]
```

Note that you can use a negative value for `force` to repel boids instead of
attracting them. Again, it should be safe to modify, add and remove these
arrays without any surprises.

## Benchmark ##

Running `benchmark.js` yielded the following results in Node:

```
50 boids: 34013 ticks/sec
100 boids: 10000 ticks/sec
150 boids: 4537 ticks/sec
200 boids: 2583 ticks/sec
250 boids: 1653 ticks/sec
300 boids: 1159 ticks/sec
350 boids: 835 ticks/sec
400 boids: 654 ticks/sec
450 boids: 518 ticks/sec
500 boids: 419 ticks/sec
550 boids: 347 ticks/sec
600 boids: 292 ticks/sec
650 boids: 249 ticks/sec
700 boids: 215 ticks/sec
750 boids: 187 ticks/sec
800 boids: 160 ticks/sec
850 boids: 130 ticks/sec
900 boids: 119 ticks/sec
950 boids: 107 ticks/sec
1000 boids: 95 ticks/sec
```

I'm very much open to pull requests that can help improve performance :)
