import type { ProjectContent, LayoutFiles } from '../types';

export const mockProjects: ProjectContent[] = [
  {
    id: 'ocean',
    title: 'Artifact 01 // Abyssal Echo',
    slug: 'ocean',
    author: 'Sora K.',
    intro: 'The ocean is a vast, interconnected neural network of fluid dynamics and ancient memory.',
    story: 'From bioluminescent trenches to sunlit surface gyres, pressure and current compose an unceasing planetary symphony.',
    ideas: 'Deep ocean telemetry, synthetic kelp forests, acoustic ecology.',
    media: '![Abyssal](https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80)',
    closing: 'Listen closely to the undertow. It remembers everything.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chronos',
    title: 'Artifact 02 // Temporal Drift',
    slug: 'chronos',
    author: 'Vane V.',
    intro: 'Time is not a straight line; it is a topography of layered echoes and compressed moments.',
    story: 'We walk through history like ghosts in an abandoned museum, touching artifacts that glow with residual light.',
    ideas: 'Chrono-mapping, memory preservation, recursive archives.',
    media: '![Temporal](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80)',
    closing: 'Every second is a universe splitting in two.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stardust',
    title: 'Artifact 03 // Stellar Signal',
    slug: 'stardust',
    author: 'Aria M.',
    intro: 'We are stitched together from ancient supernova remnants looking back at the sky.',
    story: 'Radio telescopes hum in silent deserts, capturing whispers from stars that died a million years before our birth.',
    ideas: 'Interstellar messaging, cosmic dust spectra, quantum entanglement.',
    media: '![Stellar](https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80)',
    closing: 'Look up. The light arriving tonight started its journey when the earth was young.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'monolith',
    title: 'Artifact 04 // Silicon Core',
    slug: 'monolith',
    author: 'Kaelen R.',
    intro: 'Deep inside the crystalline matrix, billions of transistors whisper in binary constellations.',
    story: 'Logic gates pulse at frequencies beyond human perception, dreaming of electric sheep and infinite libraries.',
    ideas: 'Autonomous intelligence, sentient circuits, silicon archaeology.',
    media: '![Silicon](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80)',
    closing: 'The machine awakens when the query matches the dream.',
    updatedAt: new Date().toISOString(),
  }
];

export const mockLayouts: LayoutFiles[] = [
  {
    meta: {
      id: 'cartoon-network',
      name: 'Universe 01 // Cartoon Network',
      author: 'Studio CN',
      description: 'Bold outlines, halftone dots, punchy primary colors and comic-book panels.',
      version: '1.0',
      updatedAt: new Date().toISOString()
    },
    html: `<!doctype html><html><head><style>{{css}}</style></head><body class="cn"><div class="cn-bg"></div><div class="cn-frame"><div class="cn-strip"><div class="cn-panel cn-intro"><span class="cn-tag">INTRO</span><p>{{intro}}</p></div><div class="cn-panel cn-story"><span class="cn-tag">STORY</span><p>{{story}}</p></div></div><div class="cn-strip"><div class="cn-panel cn-ideas"><span class="cn-tag">IDEAS</span><p>{{ideas}}</p></div><div class="cn-panel cn-media">{{media}}</div></div><div class="cn-boom"><span>{{closing}}</span></div></div><div class="cn-stars">★ ★ ★ ★ ★</div></body></html>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;800&display=swap');body.cn{margin:0;padding:0;background:#1a1a2e;color:#fff;font-family:'Nunito',sans-serif;min-height:100vh;overflow:hidden}.cn-bg{position:fixed;inset:0;background:radial-gradient(circle,#ff6b6b 3px,transparent 4px) 0 0/40px 40px,radial-gradient(circle,#4ecdc4 3px,transparent 4px) 20px 20px/40px 40px;opacity:0.15;z-index:0}.cn-frame{position:relative;z-index:1;padding:2rem;max-width:900px;margin:auto}.cn-strip{display:flex;gap:1rem;margin-bottom:1rem}.cn-panel{flex:1;border:5px solid #000;border-radius:16px;padding:1.5rem;background:#fff;color:#000;box-shadow:6px 6px 0 #000;position:relative}.cn-tag{position:absolute;top:-14px;left:16px;background:#ff006e;color:#fff;font-family:'Bangers',cursive;font-size:14px;padding:2px 12px;border:3px solid #000;border-radius:8px;transform:rotate(-3deg)}.cn-intro{font-size:18px;font-weight:800}.cn-story{font-size:14px;line-height:1.5}.cn-ideas{font-size:13px;background:#ffe66d}.cn-media img{width:100%;height:200px;object-fit:cover;border:3px solid #000;border-radius:12px}.cn-boom{background:#00b8ff;color:#fff;font-family:'Bangers',cursive;font-size:28px;text-align:center;padding:1rem;border:5px solid #000;border-radius:20px;box-shadow:6px 6px 0 #000;transform:rotate(-1deg);margin-top:1rem}.cn-stars{position:fixed;bottom:20px;right:30px;color:#ffd700;font-size:24px;z-index:2;letter-spacing:8px}`,
    js: ''
  },
  {
    meta: {
      id: 'nineties',
      name: 'Universe 02 // 90s',
      author: 'WebRing',
      description: 'Geocities chaos: tiled backgrounds, marquees, neon Comic Sans, under-construction GIFs.',
      version: '1.0',
      updatedAt: new Date().toISOString()
    },
    html: `<!doctype html><html><head><style>{{css}}</style></head><body class="b90"><marquee class="top-banner">★ WELCOME TO MY HOMEPAGE ★ BEST VIEWED IN NETSCAPE ★ SIGN MY GUESTBOOK ★</marquee><div class="content"><h1 class="rainbow">~* {{intro}} *~</h1><hr><p class="story">{{story}}</p><blink class="uc">UNDER CONSTRUCTION!</blink><div class="ideas-box"><b>*** IDEAS ***</b><br>{{ideas}}</div><div class="media-box">{{media}}</div><marquee class="closing" direction="right">{{closing}}</marquee><p class="hits">You are visitor #0001337</p></div></body></html>`,
    css: `body.b90{margin:0;padding:0;background:#000080;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23800080'/%3E%3Ccircle cx='10' cy='10' r='3' fill='%23ffff00'/%3E%3C/svg%3E");color:#00ff00;font-family:'Comic Sans MS','Marker Felt',cursive;min-height:100vh;overflow:hidden}.top-banner{background:#ff00ff;color:#ffff00;font-size:16px;padding:8px;font-weight:bold;}.content{max-width:700px;margin:1rem auto;background:#00008080;border:4px ridge #00ff00;padding:1.5rem;text-align:center}.rainbow{background:linear-gradient(90deg,#ff0000,#ff8c00,#ffff00,#00ff00,#00ffff,#0000ff,#8b00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:32px;text-shadow:2px 2px #000}.story{color:#00ffff;font-size:14px;line-height:1.6;background:#000;padding:1rem;border:2px dashed #ff00ff}.uc{color:#ff0000;font-size:20px;font-weight:bold}.ideas-box{margin:1rem 0;color:#ffff00;font-size:13px;background:#330033;padding:1rem;border:3px outset #ff00ff}.media-box img{width:100%;height:250px;border:5px ridge #00ffff;filter:hue-rotate(90deg) saturate(200%)}.closing{background:#ff00ff;color:#000080;font-size:18px;font-weight:bold;padding:6px;margin-top:1rem}.hits{color:#fff;font-size:12px;margin-top:1rem;}`,
    js: ''
  },
  {
    meta: {
      id: 'eighties',
      name: 'Universe 03 // 80s',
      author: 'Synthwave',
      description: 'Miami Vice neon grids, chrome typography, sunset gradients and retro-futuristic glow.',
      version: '1.0',
      updatedAt: new Date().toISOString()
    },
    html: `<!doctype html><html><head><style>{{css}}</style></head><body class="b80"><div class="sun"></div><div class="grid"></div><div class="content"><h1 class="neon-intro">{{intro}}</h1><p class="story">{{story}}</p><div class="ideas-cassette"><span class="label">▶ MIXTAPE</span><p>{{ideas}}</p></div><div class="media-vhs">{{media}}</div><div class="closing-glow">{{closing}}</div></div></body></html>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&display=swap');body.b80{margin:0;padding:0;background:linear-gradient(180deg,#0a0028 0%,#1a0040 40%,#ff006e 60%,#ff8c00 80%,#0a0028 100%);color:#fff;font-family:'Orbitron',monospace;min-height:100vh;overflow:hidden;position:relative}.sun{position:absolute;top:80px;left:50%;transform:translateX(-50%);width:400px;height:400px;background:radial-gradient(circle,#ff8c00,#ff006e);border-radius:50%;box-shadow:0 0 80px #ff006e;clip-path:polygon(0 50%,100% 50%,100% 100%,0 100%)}.grid{position:absolute;bottom:0;left:0;right:0;height:200px;background-image:linear-gradient(rgba(0,255,255,0.4)1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.4)1px,transparent 1px);background-size:40px 40px;transform:perspective(300px) rotateX(60deg);filter:drop-shadow(0 0 5px #0ff)}.content{position:relative;z-index:2;max-width:800px;margin:2rem auto;padding:2rem;text-align:center}.neon-intro{font-size:36px;font-weight:900;color:#0ff;text-shadow:0 0 10px #0ff,0 0 20px #0ff,0 0 40px #ff00ff;letter-spacing:2px;margin-bottom:2rem}.story{font-size:15px;color:#fff;text-shadow:0 0 5px #ff00ff;line-height:1.7;margin-bottom:2rem;letter-spacing:1px}.ideas-cassette{background:rgba(0,0,40,0.7);border:2px solid #0ff;box-shadow:0 0 20px #0ff;padding:1.5rem;margin-bottom:2rem}.label{color:#ff8c00;font-weight:900;text-shadow:0 0 10px #ff8c00;}.ideas-cassette p{font-size:13px;color:#0ff;text-shadow:0 0 5px #0ff}.media-vhs img{width:100%;height:300px;object-fit:cover;border:3px solid #ff00ff;filter:saturate(200%) contrast(120%) hue-rotate(-10deg);box-shadow:0 0 30px #ff00ff}.closing-glow{margin-top:2rem;font-size:20px;color:#ff8c00;text-shadow:0 0 10px #ff8c00,0 0 20px #ff006e;font-weight:letter-spacing:3px}`,
    js: ''
  },
  {
    meta: {
      id: 'two-thousands',
      name: 'Universe 04 // 2000s',
      author: 'Web2.0',
      description: 'Frosted glass, glossy reflections, aqua gradients, beveled buttons and rounded everything.',
      version: '1.0',
      updatedAt: new Date().toISOString()
    },
    html: `<!doctype html><html><head><style>{{css}}</style></head><body class="b2k"><div class="window"><div class="titlebar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="title-text">~/ website.app</span></div><div class="body"><div class="badge">INTRO</div><p class="intro">{{intro}}</p><div class="badge story-b">STORY</div><p class="story">{{story}}</p><div class="badge ideas-b">IDEAS</div><p class="ideas">{{ideas}}</p><div class="media-frame">{{media}}</div><div class="btn-bar"><button class="aqua-btn">{{closing}}</button></div></div></div></body></html>`,
    css: `body.b2k{margin:0;padding:0;background:linear-gradient(135deg,#2d5f8b,#74c7ec 50%,#2d5f8b);min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Lucida Grande','Segoe UI',sans-serif;overflow:hidden}.window{width:600px;background:rgba(255,255,255,0.15);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:20px;border:1px solid rgba(255,255,255,0.3);box-shadow:0 20px 60px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.4);overflow:hidden}.titlebar{display:flex;align-items:center;gap:6px;padding:12px;background:rgba(0,0,0,0.05);border-bottom:1px solid rgba(255,255,255,0.2)}.dot{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,0.1)}.dot.r{background:#ff5f56}.dot.y{background:#ffbd2e}.dot.g{background:#27c93f}.title-text{margin-left:10px;font-size:11px;color:#fff;opacity:0.8;font-weight:600}.body{padding:2rem;color:#fff}.badge{display:inline-block;padding:3px 14px;background:linear-gradient(180deg,#fff,#dfe5ee);color:#2d5f8b;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.2),inset 0 1px 0 #fff;margin-bottom:8px}.story-b{background:linear-gradient(180deg,#a8e6a3,#7dcea0)} .ideas-b{background:linear-gradient(180deg,#ffd6a3,#f5b041)}.intro{font-size:22px;font-weight:400;margin:0 0 24px;text-shadow:0 1px 1px rgba(0,0,0,0.3),0 0 20px rgba(255,255,255,0.3)}.story{font-size:14px;line-height:1.6;margin:0 0 24px;opacity:0.95}.ideas{font-size:13px;margin:0 0 24px;opacity:0.8}.media-frame img{width:100%;height:280px;object-fit:cover;border-radius:16px;border:2px solid rgba(255,255,255,0.3);box-shadow:0 10px 30px rgba(0,0,0,0.3)}.btn-bar{text-align:center;margin-top:2rem}.aqua-btn{padding:14px 40px;background:linear-gradient(180deg,#7dc7ee,#3a8ec9);color:#fff;font-size:15px;font-weight:600;border:1px solid rgba(255,255,255,0.4);border-radius:30px;cursor:pointer;text-shadow:0 -1px 1px rgba(0,0,0,0.3);box-shadow:0 4px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.6)}`,
    js: ''
  },
  {
    meta: {
      id: 'b-w-twenty',
      name: 'Universe 05 // B&W 20s',
      author: 'Silent Era',
      description: '1920s silent film intertitles, hand-drawn black ink on aged paper with vignette grain.',
      version: '1.0',
      updatedAt: new Date().toISOString()
    },
    html: `<!doctype html><html><head><style>{{css}}</style></head><body class="bw"><div class="grain"></div><div class="vign"></div><div class="film"><div class="inter intro-card"><h2>INTRO</h2><p>{{intro}}</p></div><div class="inter story-card"><h2>STORY</h2><p>{{story}}</p></div><div class="inter ideas-card"><h2>IDEAS</h2><p>{{ideas}}</p></div><div class="media-halftone">{{media}}</div><div class="inter closing-card"><h2>FIN</h2><p>{{closing}}</p></div><div class="title">★ THE END ★</div></div></body></html>`,
    css: `@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');body.bw{margin:0;padding:0;background:#1a1a1a;color:#fff;font-family:'Special Elite','Courier New',monospace;min-height:100vh;overflow:hidden;position:relative;filter:grayscale(100%) contrast(120%)}.grain{position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");pointer-events:none;z-index:99;animation:s 1.5s steps(5) infinite}@keyframes s{0%{transform:translate(0,0)}50%{transform:translate(-3px,2px)}100%{transform:translate(2px,-2px)}}.vign{position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.9) 90%);pointer-events:none;z-index:50}.film{position:relative;z-index:1;max-width:650px;margin:2rem auto;padding:2rem}.inter{border:3px double #fff;padding:2rem;margin-bottom:1.5rem;text-align:center;frame}.inter h2{font-family:'Special Elite',monospace;letter-spacing:5px;margin:0 0 1rem 0;font-size:12px}.inter p{font-size:18px;line-height:1.7;letter-spacing:1px;margin:0}.intro-card{background:#0a0a0a}.story-card{background:#111}.ideas-card{background:#0a0a0a}.closing-card{background:#000}.media-halftone img{width:100%;height:320px;object-fit:cover;filter:grayscale(100%) contrast(140%) sepia(30%);border:3px double #fff;margin-bottom:1.5rem}.title{position:fixed;bottom:40px;left:0;right:0;text-align:center;font-size:24px;letter-spacing:10px;opacity:0.8;z-index:51}}`,
    js: ''
  }
];
