LL = (function() {
  var display, anchor, duration, currentTime, currentPacket, currentLine;
  var buffer = [];
  var map = [];
  var useGZIP = true;
 
  var url = ''
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.05H16.11.25-chemical-cuttlefish'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.05H14.00.17-rich-ocelot'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.05H13.57.03-winsome-gnu'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.06H08.05.37-luxuriant-gnu'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.06H08.58.16-inexpensive-fox'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.06H14.53.54-adorable-ocelot'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.06H10.25.30-hilarious-gorilla'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.07H04.56.51-groovy-ibex'
  url = 'https://raw.githubusercontent.com/QueryOne/live-logs-recorded/master/2020.06.07H06.28.23-quaint-dolphin'

  var lpad = function(str, len, char) {
    if (typeof str == "number") { str = str.toString() }
    if (char == null) { char = ' ' }
    var r = len - str.length
    if (r < 0) { r = 0 }
    return char.repeat(r) + str };

  var uuid = function() { 
    var d = new Date().getTime(); if (window.performance && typeof window.performance.now === 'function') { d += performance.now() };
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(v) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (v == 'x' ? r : ( r&0x3|0x8)).toString(16) })
    return u };

  var convertTiming = function( duration ) {
    var msecs = duration
    var  secs = Math.floor(msecs / 1000) 
        msecs = msecs % 1000
    var  mins = Math.floor( secs / 60)
         secs = secs  % 60
    var hours = Math.floor( mins / 60 )
         mins = mins  % 60
    var t = {}
        t.hours = hours
        t.mins  = mins
        t.secs  = secs
        t.msecs = msecs
        t.parsed = lpad(hours,2,'0') + ':' + lpad(mins,2,'0') + ':' + lpad(secs,2,'0')
    return t }
 
  var draw = function() {
    var str = `
     <div id="display">
      <div id="content"></div>
      <div id="display-border-left"><div id="display-border-left-element"></div><div id="display-border-top-element"></div></div>
      <div id="display-border-right"><div id="display-border-right-element"></div><div id="display-border-bottom-element"></div></div>
     </div>
    `
    $('body').append(str)
  }
 
  var estimateLine = function() {
    $('#content').append('<div id="dummy">A</div>');
    var h = $('#dummy').height();
    $('#dummy').remove();
    return h
  }
 
  var rarefy = async function() {
    var ft = $('#content').height()
    $('#content').css('line-height', estimateLine() + 1 + 'px')
    var b = Math.ceil(ft / estimateLine()) + 2
    var f = buffer[0].time - 5
    for (var i = 0; i < b; i++) {
      buffer.unshift({
        line: '<div id=""><span class="sham">.</span></div>',
        time: f,
        parent: 0,
      })
    }
  }
  
  var render = async function() {
    var s = ''
    var n = 0
    for (var i = 0; i < buffer.length; i++) {
      n += 1;
      s += '<div class="LiveLog-' + i + '">' + buffer[i].line + '</div>'
      // s += '<div class="LiveLog-' + i + '">' + buffer[i].line.replace(/\<\/div>/, buffer[i].parent + '-' + i + '</div>') + '</div>'
    }
    $('#content').append(s)
    return true
  }

  var calculate = function() {
    var f = buffer[0];
    var z = buffer[(buffer.length - 1)];
    anchor = f.time;
    duration = z.time - f.time;
    
    var sh = $('#content').height();
    var n  = false;
    var t  = false;
    for (var i = (buffer.length - 1); i > -1; i--) {
      var line = $('.LiveLog-' + i);
      var pos = line.position().top || 0;
      var h   = line.height();
      var timing = buffer[i].time;
      var parent = buffer[i].parent;
      var position;
      if (parent != n || n == false) {
        n = parent;
        t = timing;
        position = pos + h - sh;
      }
      map[i] = {
        position: pos,
        time: timing - anchor,
        packet: t - anchor,
        parent: parent,
        actual: buffer[i].line,
      }
    }
  console.log(map)
  console.log(anchor)
  console.log(duration)
  }

  var retrieve = async function(url) {
    var c = await $.ajax({ url: url,
             type: 'GET',
             error: function(e,f,g) {
               console.log(e); console.log(f); console.log(g);
             }
           });
    
    var record;
    if (useGZIP) {
      var str = '';
      record = gzip.unzip(JSON.parse('[' + c + ']'));
      for (var i = 0; i < record.length; i++) { str += String.fromCharCode(record[i]) };
      record = JSON.parse(str)
    } else {
      record = JSON.parse(c);
    }
    meta = record.meta;
console.log(record)
    
    for (var i = 0; i < record.payload.length; i++) {
      var packet = record.payload[i]
      var date = packet.date
      packet.id = i + 1;
      if (packet.lines.length == 0 && packet.printed.length == 0) {
        buffer.push({line:'', time: date, parent: packet.id})
      } else {
        for (var j = 0; j < packet.lines.length; j++) {
          var line = packet.printed[j] || ''
          buffer.push({line: line, time: date, parent: packet.id})
        }
      }
    }
    
    await rarefy()
    console.log(buffer)
    
    await render()
    await calculate()
    
  }


  var playback = {currentPacket: 0, currentTime: 0, currentIndex: 0}

  playback.rewind = function() { delete playback._start; playback.stepTo(0); }
  playback.fastforward = function() { playback.stop(); playback.stepTo(map.length - 1); }

  playback.forward = function() {
    delete playback._start;
    var f = 0;
    for (var i = 0; i < map.length; i++) {
      if (f == 0 && map[i].parent >= playback.currentPacket) {
        f = map[i].parent;
      }
      if (f != 0 && (f + 1) <= map[i].parent) {
        playback.stepTo(i);
        return;
      } else if (f >= map[map.length - 1].parent) {
        playback.stepTo(map.length - 1);
        return;
      }
    }
  }
  playback.backward = function() {
    delete playback._start;
    var z = playback.currentPacket;
    for (var i = playback.currentIndex; i > -1; i--) {
      if (map[i].parent < playback.currentPacket) {
        z = map[i].parent;
      }
      if (z < playback.currentPacket - 1 && (Math.max(z - 1),0) <= map[i].parent) {
        playback.stepTo(i + 1);
        break;
      }
    }
  }

  playback.stepTo = function(index, suppress) {
    playback.currentPacket = map[index].parent;
    playback.currentIndex = index;
    playback.currentTime = map[index].time;
    playback._position = map[index].time - 1;

    // update scrubber
    if (scrubber && !suppress) { 
      scrubber.updatePosition(playback, duration)
    }

    /* Update UI (#content, scrubber, clock) */
    var content = document.getElementById('content')
    var h = 0
    if (index == map.length - 1) { h = $('.LiveLog-' + index).height() }
    var u = map[index].position + h - content.offsetHeight;

    var display = document.getElementById('play-display');
    var t = '';
        t += convertTiming(playback._position).parsed + ' <span class="play-display-muted">| ' + convertTiming(duration).parsed + '</span>';
    fastdom.measure(function() {
      fastdom.mutate(function() {
        content.scrollTop = u;
        display.innerHTML = t;
      })
    })
  }
  
  playback.stepToTime = function(time, suppress) {
    var destination = 0;
    for (var i = 0; i < map.length; i++) {
      if (map[i].time > time) {
        destination = i - 1;
        break;
      }
      if (i == map.length - 1 && time > 0) { destination = map.length - 1 };  
    }
    playback.stepTo(destination, suppress);
  }

  playback.assign = function(key, val) {
    playback[key] = val;
  }

  /* It gets funky here with Timing! */

  playback._continue = false; // Kills the playback
  playback._position = 0;
  
  playback.toggle = function() {
    if (playback._continue) {
      playback.pause();
    } else {
      playback.play();
      $('#play').empty().append('II').addClass('pause');
      $('#stop').empty().append('&FilledSmallSquare;');
    }
  }

  playback.play = function() {
    playback._continue = true;
    playback.loop()
  }

  playback.loop = function(timestamp) {
    if (!playback._continue) { return }
    if (!playback._start) { playback._start = timestamp - playback._position };
    if (!playback._last) { playback._last = timestamp };
    var total = timestamp - playback._start;
    var delta = timestamp - playback._last;
    playback._last = timestamp;

    var position = Math.max(0, playback.currentIndex - 45);
    var lastLine = map.length - 1;
    var pointer = 0;
    var pointerPacket = 0;
    for (var i = position; i < lastLine; i++) {
      var line = map[i];
      if (line.time > total && line.parent != pointerPacket) {
        playback._position = line.time;
        playback.stepTo(i);
        break;
      }
      pointer = i;
      pointerPacket = map[i].parent;
    }
    // console.log(playback._start + ' >> ' + playback._last + ' >>> ' + playback._position + ' cf ' + total)
    if (total > duration) { playback.pause(); return; }

    var display = document.getElementById('play-display');
    var t = '';
        t += convertTiming(total).parsed + ' <span class="play-display-muted">| ' + convertTiming(duration).parsed + '</span>';

    fastdom.measure(function() {
      fastdom.mutate(function() {
        display.innerHTML = t;
      })
    })
    playback._animationFrame = requestAnimationFrame(playback.loop)
  }

  playback.stop = function() {
    if (playback._continue) {
      playback._continue = false;
      cancelAnimationFrame(playback._animationFrame)
      delete playback._start;
      delete playback._last;
      playback._position = 0;

      playback.stepTo(0);
      $('#play').empty().append('&rtri;').removeClass('pause');
      $('#stop').empty().append('&EmptySmallSquare;');
    }
  }
  playback.pause = function() {
    playback._continue = false;
    cancelAnimationFrame(playback._animationFrame)
    delete playback._start;
    $('#play').empty().append('&rtri;').removeClass('pause');
    $('#stop').empty().append('&EmptySmallSquare;');
  }
  
  var begin = function() {
    $('#url').val(url);
    
    draw();
    retrieve(url);

    behaviours();
  }

  var behaviours = function() {
    /* scrubber */
    $('body').on('scrubber-interact', function(e,v) {
      var time = v * duration;
      var suppress = true;
      playback.stepToTime(time, suppress);
      playback.forward();
    })

    $('#content').scroll(function(e) {
      
    })
  }


  return {
    begin  : begin,
    display: display,

    backward   : playback.backward,
    fastforward: playback.fastforward,
    forward    : playback.forward,
    play       : playback.toggle,
    rewind     : playback.rewind,
    stepTo     : playback.stepTo,
    stop       : playback.stop,
    assign     : playback.assign,

    yield: function() { return {anchor: anchor, buffer: buffer, duration: duration, playback: playback, map: map } },
  }
})()
