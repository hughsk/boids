function benchmark(boids) {
  function test(count, ticks) {
    var b = boids({ boids: count })
      , i = ticks
      , start = +new Date

    while (i--) b.tick()

    return ticks / ((new Date - start) / 1000)
  }

  for (var i = 50; i <= 1000; i += 50) {
    console.log(i + ' boids: ' + ~~test(i, 5000) + ' ticks/sec')
  }
}

benchmark(require('./'))
