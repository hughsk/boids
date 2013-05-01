
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
  for (var i = 0, l = opts.boids === undefined ? 50 : opts.boids; i < l; i += 1) {
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
    currPos = boids[current].pos

    // Attractors
    target = attractorCount
    while (target--) {
      attractor = attractors[target]
      spareX = currPos[0] - attractor[0]
      spareY = currPos[1] - attractor[1]
      distSquared = spareX*spareX + spareY*spareY

      if (distSquared < attractor[2]*attractor[2]) {
        length = Math.sqrt(spareX*spareX+spareY*spareY)
        boids[current].spd[0] -= (attractor[3] * spareX / length) || 0
        boids[current].spd[1] -= (attractor[3] * spareY / length) || 0
      }
    }

    target = size
    while (target--) {
      if (target === current) continue
      targPos = boids[target].pos

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
        aforceX += boids[target].spd[0]
        aforceY += boids[target].spd[1]
      }
    }

    // Separation
    length = Math.sqrt(sforceX*sforceX + sforceY*sforceY)
    boids[current].spd[0] += (sepForce * sforceX / length) || 0
    boids[current].spd[1] += (sepForce * sforceY / length) || 0
    // Cohesion
    length = Math.sqrt(cforceX*cforceX + cforceY*cforceY)
    boids[current].spd[0] -= (cohForce * cforceX / length) || 0
    boids[current].spd[1] -= (cohForce * cforceY / length) || 0
    // Alignment
    length = Math.sqrt(aforceX*aforceX + aforceY*aforceY)
    boids[current].spd[0] -= (alignment * aforceX / length) || 0
    boids[current].spd[1] -= (alignment * aforceY / length) || 0
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
