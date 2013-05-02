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
  })

document.body.onmousemove = function(e) {
  var halfHeight = canvas.height/2
      , halfWidth = canvas.width/2

  attractors[0][0] = e.x - halfWidth
  attractors[0][1] = e.y - halfHeight
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.appendChild(canvas)

var tock = 0
raf(window).on('data', function() {
  var boidData = boids.boids

  tock += 1
  tock = tock % 3
  boids.tick()

  var halfHeight = canvas.height/2
    , halfWidth = canvas.width/2

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#fff'
  for (var i = 0, l = boidData.length; i < l; i += 1) {
    ctx.fillRect(boidData[i][0] + halfWidth, boidData[i][1] + halfHeight, 5, 5)
  }
})
