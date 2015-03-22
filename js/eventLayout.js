var EventLayout = (function() {
  function detectOverlay(e1, e2) {
    return (e1.start >= e2.start && e1.start<= e2.end) ||
           (e1.end >= e2.start && e1.end <= e2.end);
  }

  // group events having overlays
  function segamentation(events) {
    var segments = [];
    events.forEach(function(e) {
      var overlaySegment = null;
      segments.forEach(function(s, index) {
        if (s.delete) return;
        if (detectOverlay(e, s)) {
              overlaySegment = s;
              if (!e.segment) {
                overlaySegment.events.push(e);
                e.segment = s;
                if (e.start < s.start) {
                  s.start = e.start;
                }
                if (e.end > s.end) {
                  s.end = e.end;
                }
              }
              else {
                e.segment.events = s.events.concat(e.segment.events);
                if (s.start < e.segment.start) {
                  e.segment.start = s.start;
                }
                if (s.end > e.segment.end) {
                  e.segment.end = s.end;
                }
                s.delete = true;
              }
            }
      });

      if (overlaySegment == null) {
        var newSegment = {
          start: e.start,
          end: e.end,
          events: [e]
        };
        e.segment = newSegment;
        segments.push(newSegment);
      }
    });
    return segments;
  }

  // try to stack events
  function arrangeEvents(segments) {
    var eventLocations = [];
    segments.forEach(function(s) {
      if (s.delete) return;
      var layout = [];
      s.events.forEach(function(e) {
        var placed = layout.some(function(column) {
          var collide = column.some(function(row) {
            return detectOverlay(e, row);
          });
          if (!collide) {
            column.push(e);
            return true;
          }
          return false;
        });
        if (!placed) {
          layout.push([e]);
        }
      });

      var width = 600 / layout.length;
      layout.forEach(function(column, col) {
        column.forEach(function(e) {
          eventLocations.push({
            top: e.start,
            height: e.end - e.start,
            left: col * width,
            width: width
          });
        });
      });
    });
    return eventLocations;
  }

  return {
    arrange: function (events) {
      if (events.length == 0) return [];
      var segments = segamentation(events);
      return arrangeEvents(segments);
    }
  }
}());
