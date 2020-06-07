
// https://stackoverflow.com/a/4081293
(function($) {
    function startTrigger(e) {
        var $elem = $(this);
        $elem.data('mouseheld_timeout', setTimeout(function() {
            $elem.trigger('mouseheld');
        }, e.data));
    }

    function stopTrigger() {
        var $elem = $(this);
        clearTimeout($elem.data('mouseheld_timeout'));
    }

    var mouseheld = $.event.special.mouseheld = {
        setup: function(data) {
            // the first binding of a mouseheld event on an element will trigger this
            // lets bind our event handlers
            var $this = $(this);
            $this.bind('mousedown', +data || mouseheld.time, startTrigger);
            $this.bind('mouseleave mouseup', stopTrigger);
        },
        teardown: function() {
            var $this = $(this);
            $this.unbind('mousedown', startTrigger);
            $this.unbind('mouseleave mouseup', stopTrigger);
        },
        time: 45 // default to 750ms
    };
})(jQuery)

scrubber = {}

scrubber.mousedown = false;
scrubber.ticks     = [];
scrubber.current   = {};

scrubber.setup = function() {
  /* Call only once all elements have been rendered */
  scrubber.body     = $('body');
  scrubber.content  = $('#content');
  scrubber._content = document.getElementById('content')
  scrubber.current  = $('#scrubber-fill');
  scrubber.width    = $('#scrubber').width();
  scrubber.playing  = false;

  /* Behaviours */
  $('#scrubber').on('click', function(e) {
    scrubber.interact( e.clientX, this.getClientRects()[0].left )
  }).bind('mouseheld', function(e) {
    scrubber.mousedown = true
    var y = LL.yield().playback;
    scrubber.playing = y._continue;
    y.pause();
  })
  $(document).on('mouseup', scrubber.mouseUp)
  $(document).on('mousemove', scrubber.mouseMove)
  $('#content').bind('mousewheel DOMMouseScroll', function(e) {
    // Up or Down?
    var delta = 0; 
    if (typeof e.originalEvent != 'undefined' && e.originalEvent.deltaY) { delta = e.originalEvent.deltaY };

    var h = scrubber._content.scrollTop + scrubber._content.offsetHeight;
    var y = LL.yield();
    var t = 0;
    var yield = false;
 
    if (delta < 0) {
      for (var i = (y.map.length - 1); i > -1; i--) {
        if (h > y.map[i].position) {
          t = y.map[i].time;
          LL.assign('currentPacket', y.map[i].parent);
          LL.assign('currentIndex', i);
          LL.assign('currentTime', y.map[i].time);
          break;
        }
      }
    } else {
      for (var i = 0; i < y.map.length; i++) {
        if (yield || i == y.map.length - 1) {
          t = y.map[i].time;
          LL.assign('currentPacket', y.map[i].parent);
          LL.assign('currentIndex', i);
          LL.assign('currentTime', y.map[i].time);
          break;
        }
        if (h < y.map[i].position) {
          yield = true;
        }
      }
    }
    var r = t / y.duration;
    var v = (100 * Math.max(0, Math.min(1, r))) + '%'
    fastdom.measure(function() {
      fastdom.mutate(function() {
        scrubber.current.css('width', v)
      })
    })
  })

  /* UI Concerns */
  $('#scrubber').on('mouseenter', function() { $(this).css('height','12px') });
  $('#scrubber').on('mouseleave', function() { $(this).css('height', '4px') });
}

scrubber.mouseUp = function() {
  if (scrubber.mousedown) {
    scrubber.mousedown = false;
    for (var i = 0; i < scrubber.ticks.length; i++) {
      clearInterval(scrubber.ticks[i])
    }
    if (scrubber.playing) {
      LL.yield().playback.play();
    }
  }
}

scrubber.mouseMove = function(e) {
  if (!scrubber.mousedown) { return }
  e.preventDefault();
  scrubber.interact( e.clientX, document.getElementById('scrubber').getClientRects()[0].left )
}

scrubber.interact = function(x, offset) {
  var position = (x - offset) / scrubber.width;
  var v = (100 * Math.max(0, Math.min(1, position))) + '%'
  fastdom.measure(function() {
    fastdom.mutate(function() {
      scrubber.current.css('width', v)
    })
  })
  /* Update the content */
  scrubber.body.trigger('scrubber-interact', position)
}

scrubber.updatePosition = function(pb, duration) {
  var r = pb.currentTime / duration * 100 + '%'
  fastdom.measure(function() {
    fastdom.mutate(function() {
      scrubber.current.css('width', r)
    })
  })
}
