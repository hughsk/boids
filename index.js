
var EventEmitter = require('events').EventEmitter
  , inherits = require('inherits')
  , POSITIONX = 0
  , POSITIONY = 1
  , SPEEDX = 2
  , SPEEDY = 3

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
  for (var i = 0, l = opts.boids === undefined ? 50 : opts.boids; i < l; i += 1) {
    boids[i] = [
        Math.random()*25, Math.random()*25 // position
      , 0, 0                               // speed
    ]
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
    , sforceX, sforceY
    , cforceX, cforceY
    , aforceX, aforceY
    , spareX, spareY
    , attractors = this.attractors
    , attractorCount = attractors.length
    , distSquared
    , currPos
    , targPos
    , length
    , target

  while (current--) {
    sforceX = 0; sforceY = 0
    cforceX = 0; cforceY = 0
    aforceX = 0; aforceY = 0
    currPos = boids[current]

    // Attractors
    target = attractorCount
    while (target--) {
      attractor = attractors[target]
      spareX = currPos[0] - attractor[0]
      spareY = currPos[1] - attractor[1]
      distSquared = spareX*spareX + spareY*spareY

      if (distSquared < attractor[2]*attractor[2]) {
        length = Math.sqrt(spareX*spareX+spareY*spareY)
        boids[current][SPEEDX] -= (attractor[3] * spareX / length) || 0
        boids[current][SPEEDY] -= (attractor[3] * spareY / length) || 0
      }
    }

    target = size
    while (target--) {
      if (target === current) continue
      targPos = boids[target]

      spareX = currPos[0] - targPos[0]
      spareY = currPos[1] - targPos[1]
      distSquared = spareX*spareX + spareY*spareY

      if (distSquared < sepDist) {
        sforceX += spareX
        sforceY += spareY
      } else
      if (distSquared < cohDist) {
        cforceX += spareX
        cforceY += spareY
        aforceX += boids[target][SPEEDX]
        aforceY += boids[target][SPEEDY]
      }
    }

    // Separation
    length = Math.sqrt(sforceX*sforceX + sforceY*sforceY)
    boids[current][SPEEDX] += (sepForce * sforceX / length) || 0
    boids[current][SPEEDY] += (sepForce * sforceY / length) || 0
    // Cohesion
    length = Math.sqrt(cforceX*cforceX + cforceY*cforceY)
    boids[current][SPEEDX] -= (cohForce * cforceX / length) || 0
    boids[current][SPEEDY] -= (cohForce * cforceY / length) || 0
    // Alignment
    length = Math.sqrt(aforceX*aforceX + aforceY*aforceY)
    boids[current][SPEEDX] -= (alignment * aforceX / length) || 0
    boids[current][SPEEDY] -= (alignment * aforceY / length) || 0
  }
  current = size

  // Apply speed/acceleration for
  // this tick
  while (current--) {
    if (speedLimit) {
      distSquared = boids[current][SPEEDX]*boids[current][SPEEDX] + boids[current][SPEEDY]*boids[current][SPEEDY]
      if (distSquared > speedLimit) {
        ratio = speedLimitRoot / Math.sqrt(distSquared)
        boids[current][SPEEDX] *= ratio
        boids[current][SPEEDY] *= ratio
      }
    }

    boids[current][POSITIONX] += boids[current][SPEEDX]
    boids[current][POSITIONY] += boids[current][SPEEDY]
  }

  this.emit('tick', boids)
}
