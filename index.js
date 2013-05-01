
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
