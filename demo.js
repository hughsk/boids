var raf = require('raf')
  , Boids = require('boids')

var canvas = document.createElement('canvas')
  , ctx = canvas.getContext('2d')
  , boids = Boids({
      boids: 200
    , speedLimit: 2
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

canvas.width = window.innerWidth
canvas.height = window.innerHeight

document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.appendChild(canvas)

raf(window).on('data', boids.tick.bind(boids))
