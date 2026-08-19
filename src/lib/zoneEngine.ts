/**
 * ZoneEngine — injects interactjs-powered drag/resize into zone containers inside an iframe.
 *
 * Zones are <div class="zone" data-zone="intro"> elements in the layout HTML.
 * Uses interactjs for reliable drag, resize, snap-to-grid, and snap-back behavior.
 * Zones are protected from removal. Custom JS can add interactions on top.
 */

const INTERACTJS_CDN = `<script src="https://cdn.jsdelivr.net/npm/interactjs@1.10.28/dist/interact.min.js"><\/script>`;

export const ZONE_ENGINE_SCRIPT = `
${INTERACTJS_CDN}
<script>
(function() {
  if (typeof interact === 'undefined') return;

  const GRID = 8;
  const SNAP_BACK_RANGE = 90;   // release within this radius of the original spot → snap back
  const PULL_RANGE = 70;        // within this radius the ghost pulls the element back
  const zones = Array.from(document.querySelectorAll('.zone'));
  if (!zones.length) return;

  let highestZ = 100;

  // Store original positions BEFORE interact touches anything
  zones.forEach(zone => {
    const cs = window.getComputedStyle(zone);
    zone.dataset.origLeft = cs.left;
    zone.dataset.origTop = cs.top;
    zone.dataset.origRight = cs.right;
    zone.dataset.origBottom = cs.bottom;
    zone.dataset.origWidth = cs.width;
    zone.dataset.origHeight = cs.height;

    const r = zone.getBoundingClientRect();
    zone.__orig = { x: r.left, y: r.top, width: r.width, height: r.height };
  });

  // A ghost panel marks the original spot so the element can snap back.
  function createGhost(zone) {
    if (zone.dataset.ghostId) return;
    // The element hasn't moved yet on drag start → its rect is the original spot.
    const r = zone.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'zone-ghost';
    const key = zone.getAttribute('data-zone') || zone.classList[0] || 'zone';
    ghost.dataset.ghostFor = key;
    ghost.style.cssText =
      'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;' +
      'width:' + r.width + 'px;height:' + r.height + 'px;box-sizing:border-box;' +
      'border:2px dashed rgba(88,166,255,0.65);border-radius:8px;' +
      'background:rgba(88,166,255,0.08);' +
      'display:flex;align-items:center;justify-content:center;' +
      'color:rgba(88,166,255,0.75);font:11px system-ui,sans-serif;letter-spacing:.5px;' +
      'pointer-events:none;z-index:10000;transition:all .15s;';
    ghost.textContent = '↩ snap back';
    document.body.appendChild(ghost);
    zone.dataset.ghostId = key;
  }

  function removeGhost(zone) {
    const key = zone.dataset.ghostId;
    if (!key) return;
    const ghost = Array.from(document.querySelectorAll('.zone-ghost')).find(g => g.dataset.ghostFor === key);
    if (ghost) ghost.remove();
    delete zone.dataset.ghostId;
  }

  function highlightGhost(zone, on) {
    const key = zone.dataset.ghostId;
    if (!key) return;
    const ghost = Array.from(document.querySelectorAll('.zone-ghost')).find(g => g.dataset.ghostFor === key);
    if (ghost) {
      if (on) {
        ghost.style.borderColor = 'rgba(88,166,255,0.95)';
        ghost.style.background = 'rgba(88,166,255,0.16)';
        ghost.style.boxShadow = '0 0 20px rgba(88,166,255,0.4)';
      } else {
        ghost.style.borderColor = 'rgba(88,166,255,0.65)';
        ghost.style.background = 'rgba(88,166,255,0.08)';
        ghost.style.boxShadow = '';
      }
    }
  }

  // --- PUBLIC API ---
  window.ZoneEngine = {
    zones: document.querySelectorAll('.zone'),

    makeDraggable: function(el, handle) {
      interact(el).draggable({
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      });
    },

    makeResizable: function(el) {
      interact(el).resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const target = event.target;
            let x = (parseFloat(target.getAttribute('data-x')) || 0);
            let y = (parseFloat(target.getAttribute('data-y')) || 0);
            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        },
        modifiers: [
          interact.modifiers.restrictSize({ min: { width: 80, height: 40 } })
        ]
      });
    },

    protectZones: function() {
      var orig = Element.prototype.removeChild;
      Element.prototype.removeChild = function(child) {
        if (child && child.classList && child.classList.contains('zone')) {
          console.warn('[ZoneEngine] Cannot remove protected zone.');
          return child;
        }
        return orig.apply(this, arguments);
      };
    },

    snapToOriginal: function(el) {
      var tx = parseFloat(el.getAttribute('data-x')) || 0;
      var ty = parseFloat(el.getAttribute('data-y')) || 0;
      if (Math.abs(tx) < SNAP_BACK_RANGE && Math.abs(ty) < SNAP_BACK_RANGE) {
        el.style.transform = '';
        el.setAttribute('data-x', 0);
        el.setAttribute('data-y', 0);
      }
    }
  };

  window.ZoneEngine.protectZones();

  // --- Make all zones draggable + resizable via interactjs ---
  interact('.zone').draggable({
    inertia: false,
    modifiers: [
      // Panels move freely anywhere in the page (not locked to their parent).
      interact.modifiers.restrictRect({ restriction: document.body, endOnly: false })
    ],
    listeners: {
      start(event) {
        var target = event.target;
        target.style.zIndex = ++highestZ;
        target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
        target.style.transition = 'box-shadow 0.15s';
        // Leave a ghost panel at the original spot to snap back into.
        createGhost(target);
      },
      move(event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Magnetic pull: close to the original spot, the ghost pulls it back.
        var dist = Math.sqrt(x * x + y * y);
        if (dist < PULL_RANGE && dist > 0.5) {
          var k = (1 - dist / PULL_RANGE) * 0.6;
          x += (0 - x) * k;
          y += (0 - y) * k;
          highlightGhost(target, true);
        } else {
          highlightGhost(target, false);
        }

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      end(event) {
        var target = event.target;
        target.style.boxShadow = '';
        target.style.cursor = 'grab';
        var x = parseFloat(target.getAttribute('data-x')) || 0;
        var y = parseFloat(target.getAttribute('data-y')) || 0;

        // Snap back into the ghost: the panel returns to its original place.
        if (Math.sqrt(x * x + y * y) < SNAP_BACK_RANGE) {
          target.style.transform = '';
          target.setAttribute('data-x', 0);
          target.setAttribute('data-y', 0);
          removeGhost(target);
          return;
        }
        // Otherwise it stays moved and the ghost remains as the snap-back slot.
        highlightGhost(target, false);
      }
    }
  });

  interact('.zone').resizable({
    edges: { left: '.zone-resizer', right: '.zone-resizer', bottom: '.zone-resizer', top: false },
    listeners: {
      start(event) {
        event.target.style.zIndex = ++highestZ;
      },
      move(event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0);
        var y = (parseFloat(target.getAttribute('data-y')) || 0);
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    },
    modifiers: [
      interact.modifiers.restrictSize({ min: { width: 80, height: 40 } })
    ]
  });

  // --- Add resize handles + style zones ---
  zones.forEach(function(zone) {
    zone.style.cursor = 'grab';
    zone.style.touchAction = 'none';

    // Add resize handle
    if (!zone.querySelector('.zone-resizer')) {
      var resizer = document.createElement('div');
      resizer.className = 'zone-resizer';
      resizer.style.cssText = 'position:absolute;bottom:0;right:0;width:16px;height:16px;cursor:nwse-resize;z-index:100;opacity:0;transition:opacity 0.15s;background:linear-gradient(135deg,transparent 50%,rgba(255,255,255,0.4) 50%);';
      zone.appendChild(resizer);
    }

    // Hover effects
    zone.addEventListener('mouseenter', function() {
      var r = zone.querySelector('.zone-resizer');
      if (r) r.style.opacity = '1';
      zone.style.boxShadow = '0 0 0 2px rgba(88,166,255,0.5)';
    });
    zone.addEventListener('mouseleave', function() {
      var r = zone.querySelector('.zone-resizer');
      if (r) r.style.opacity = '0';
      if (!zone.getAttribute('data-x') && !zone.getAttribute('data-y')) {
        zone.style.boxShadow = '';
      }
    });
  });

})();
</script>
`;

/**
 * Inject the zone engine script + optional custom JS into an iframe's srcdoc.
 */
export function injectZoneEngine(html: string, customJs?: string): string {
  let scriptToInject = ZONE_ENGINE_SCRIPT;
  if (customJs && customJs.trim()) {
    scriptToInject += '<script>' + customJs + '<\/script>';
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', scriptToInject + '</body>');
  }
  return html + scriptToInject;
}

/** Content panel class tokens per universe, mapped to their semantic zone. */
const PANEL_MARKS: Record<string, Array<[string, string]>> = {
  'cartoon-network': [
    ['cn-intro', 'intro'],
    ['cn-story', 'story'],
    ['cn-ideas', 'ideas'],
    ['cn-media', 'media'],
    ['cn-boom', 'closing'],
  ],
  eighties: [
    ['neon-intro', 'intro'],
    ['story', 'story'],
    ['ideas-cassette', 'ideas'],
    ['media-vhs', 'media'],
    ['closing-glow', 'closing'],
  ],
  nineties: [
    ['rainbow', 'intro'],
    ['story', 'story'],
    ['ideas-box', 'ideas'],
    ['media-box', 'media'],
    ['closing', 'closing'],
  ],
  'two-thousands': [
    ['intro', 'intro'],
    ['story', 'story'],
    ['ideas', 'ideas'],
    ['media-frame', 'media'],
    ['btn-bar', 'closing'],
  ],
  'b-w-twenty': [
    ['intro-card', 'intro'],
    ['story-card', 'story'],
    ['ideas-card', 'ideas'],
    ['media-halftone', 'media'],
    ['closing-card', 'closing'],
  ],
};

/** Add the `.zone` class + `data-zone` attribute to an element whose class list contains `token`. */
function addZoneClass(html: string, token: string, zone: string): string {
  const re = new RegExp(`class="([^"]*\\b${token}\\b[^"]*)"`, 'g');
  return html.replace(re, (match, cls: string) =>
    cls.includes('zone') ? match : `class="${cls} zone" data-zone="${zone}"`
  );
}

/**
 * Mark a universe's own content panels as movable `.zone` containers so the
 * zone engine (interact.js) can drag/resize them. Unknown layouts are left
 * untouched (their HTML should declare `.zone` elements itself).
 */
export function markZonePanels(html: string, layoutId?: string): string {
  const marks = layoutId ? PANEL_MARKS[layoutId] : undefined;
  if (!marks) return html;
  let out = html;
  for (const [token, zone] of marks) {
    out = addZoneClass(out, token, zone);
  }
  return out;
}
