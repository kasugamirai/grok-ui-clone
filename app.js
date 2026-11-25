/*!
 * Orbit — a chat app UI study (layout + motion), written from scratch.
 * Vanilla JS, no dependencies. Replies are simulated locally.
 */
(() => {
  'use strict';

  /* ================================================================== *
   * Helpers
   * ================================================================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent;
  const isMac = /Mac|iPhone|iPad|iPod/i.test(platform);
  const MOD = isMac ? '⌘' : 'Ctrl';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // True when the OS asks for less motion or the in-app "Reduce motion" setting is on.
  const motionOff = () => reduceMotion.matches || document.documentElement.classList.contains('reduce-motion');
  const mobileMQ = matchMedia('(max-width: 767px)');
  const hasCJK = (s) => /[぀-ヿ㐀-鿿가-힯]/.test(s);
  const isTyping = (t) => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const FENCE = '```';

  /* ================================================================== *
   * Icons (24×24, stroke = currentColor)
   * ================================================================== */
  const dot = (cx, cy, r = 1.4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" stroke="none"/>`;
  const THUMB = '<path d="M7.5 10.5v9h-2a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM7.5 10.5l3.4-6a1.8 1.8 0 0 1 3.3 1.3l-.7 3.2h4.8a2 2 0 0 1 2 2.3l-1.1 6.5a2 2 0 0 1-2 1.7H7.5"/>';
  const ICONS = {
    sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><path d="M9.5 4.5H7A3.5 3.5 0 0 0 3.5 8v8A3.5 3.5 0 0 0 7 19.5h2.5z" fill="currentColor" stroke="none"/>',
    search: '<circle cx="10.75" cy="10.75" r="6.25"/><path d="m15.5 15.5 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="15.5" cy="9.5" r="1.6"/><path d="m3.8 16.8 4.3-4.3a1.6 1.6 0 0 1 2.3 0l5.6 5.6M14 15.6l1.3-1.3a1.6 1.6 0 0 1 2.3 0l2.6 2.6"/>',
    library: '<path d="M4.5 19.5 7.5 4.5M11.5 4.5v15M15.5 4.5v15M19.5 4.5v15"/>',
    pin: '<path d="M9 3.5h6l-.9 5.2 3.4 3.3v1.5h-11V12l3.4-3.3z"/><path d="M12 13.5v7"/>',
    chevronDown: '<path d="m7 10 5 5 5-5"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3"/>',
    wave: '<path d="M3.5 10.5v3M7 8v8M10.5 5v14M14 7.5v9M17.5 9.5v5M21 11v2"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
    dashed: '<circle cx="12" cy="12" r="8" stroke-dasharray="2.6 2.6"/>',
    panelRight: '<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><path d="M14.5 4.5v15"/>',
    bubbles: '<path d="M6.5 14.7 3.5 15.5l.8-3A6 6 0 1 1 15.2 7.5"/><path d="M19.3 17.3 20.5 20.5l-3.2-1.2A5.5 5.5 0 1 1 19.3 17.3z"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>',
    pencil: '<path d="M15.2 4.8a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="m13.5 6.5 3 3"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>',
    video: '<rect x="3.5" y="6" width="12.5" height="12" rx="2.5"/><path d="m16 10.5 4.5-2.7v8.4L16 13.5"/>',
    code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
    thumbUp: THUMB,
    thumbDown: `<g transform="rotate(180 12 12)">${THUMB}</g>`,
    more: dot(6, 12) + dot(12, 12) + dot(18, 12),
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    sparkle: '<path d="M12 4c.6 4.4 3.6 7.4 8 8-4.4.6-7.4 3.6-8 8-.6-4.4-3.6-7.4-8-8 4.4-.6 7.4-3.6 8-8z"/>',
    apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><path d="M16.75 13.5v6.5M13.5 16.75H20"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2h7.4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    folderPlus: '<path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2h7.4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M12 10.5v6M9 13.5h6"/>',
    bolt: '<path d="M13 3.5 5.5 13H11l-1 7.5 7.5-9.5H12z"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/>' + dot(12, 16.9, 0.9),
    logout: '<path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16l-4-4 4-4M6 12h9"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3"/>',
    moon: '<path d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7z"/>',
    monitor: '<rect x="3.5" y="4.5" width="17" height="12" rx="2.5"/><path d="M9 20h6M12 16.5V20"/>',
    paperclip: '<path d="m19 11.5-6.8 6.8a4.3 4.3 0 0 1-6.1-6.1l7.1-7.1a2.9 2.9 0 0 1 4.1 4.1l-7 7a1.4 1.4 0 0 1-2-2l6.3-6.3"/>',
    plug: '<path d="M9 3.5v4M15 3.5v4M7 7.5h10v3a5 5 0 0 1-10 0zM12 15.5v5"/>',
    wand: '<path d="m4.5 19.5 10-10M15 4v2.5M20 9h-2.5M18.5 5.5 17 7M19 13.5l-1.5-1.5M11 5l1.5 1.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chat: '<path d="M12 4a8 8 0 0 0-6.9 12l-1 3.6 3.7-1A8 8 0 1 0 12 4z"/>',
    list: '<path d="M9 6.5h10.5M9 12h10.5M9 17.5h10.5M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
    share: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
    trash: '<path d="M4.5 7h15M10 4h4M6.5 7l.9 11.2a2 2 0 0 0 2 1.8h5.2a2 2 0 0 0 2-1.8L17.5 7"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
    volume: '<path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    play: '<path d="M8 6.5v11l9-5.5z" fill="currentColor" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/>',
    orbit: '<circle cx="11" cy="13" r="5.5"/>' + dot(17.5, 6.5, 2.2),
    plane: '<path d="M20.5 3.5 3.5 10.5l6.5 2.5 2.5 6.5zM10 13l4.5-4.5"/>',
    doc: '<path d="M7 3.5h7l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 7 3.5z"/><path d="M13.5 3.5v5h5"/>',
    chef: '<path d="M7 13.5a3.5 3.5 0 1 1 1.6-6.6 4 4 0 0 1 6.8 0A3.5 3.5 0 1 1 17 13.5v5H7z"/>',
    sigma: '<path d="M17 5.5H7l5.5 6.5L7 18.5h10"/>',
  };
  // Extra icons used by the account menu and the settings dialog.
  Object.assign(ICONS, {
    user: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="10" r="3"/><path d="M6.6 18.2a6.5 6.5 0 0 1 10.8 0"/>',
    contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    bot: '<rect x="5" y="7.5" width="14" height="11" rx="3.5"/><path d="M12 4.5v3"/>' + dot(9.5, 13, 1.1) + dot(14.5, 13, 1.1),
    shield: '<path d="M12 3.5 5.5 6v5.5c0 4.2 2.8 7.4 6.5 9 3.7-1.6 6.5-4.8 6.5-9V6z"/>',
    card: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M3.5 10h17M7 15h3"/>',
    bars: '<path d="M5.5 19.5v-6M10 19.5V9M14.5 19.5V5M19 19.5v-9"/>',
    arrowUpRight: '<path d="M8 16 16 8M9 8h7v7"/>',
    chevronRight: '<path d="m10 7 5 5-5 5"/>',
    userPlus: '<circle cx="10" cy="9" r="3.5"/><path d="M3.5 19a6.5 6.5 0 0 1 13 0M18.5 8v6M15.5 11h6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    gear: `<path d="${gearPath()}"/><circle cx="12" cy="12" r="2.6"/>`,
    calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16M10 10v9"/>',
  });
  function gearPath(teeth = 8, rOut = 8.6, rIn = 6.4) {
    const step = (Math.PI * 2) / teeth;
    const pts = [];
    for (let i = 0; i < teeth; i++) {
      const a = i * step - Math.PI / 2;
      pts.push([a - step * 0.34, rIn], [a - step * 0.2, rOut], [a + step * 0.2, rOut], [a + step * 0.34, rIn]);
    }
    return 'M' + pts.map(([ang, r]) => `${(12 + r * Math.cos(ang)).toFixed(2)} ${(12 + r * Math.sin(ang)).toFixed(2)}`).join('L') + 'Z';
  }
  const icon = (name, cls = '') => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  function hydrateIcons(root = document) {
    $$('i[data-icon]', root).forEach((n) => {
      n.insertAdjacentHTML('afterend', icon(n.dataset.icon, n.className));
      n.remove();
    });
  }

  /* ================================================================== *
   * Content (all placeholder data)
   * ================================================================== */
  const GREETINGS = [
    "What's on the agenda today?",
    'Ready when you are.',
    'How can I help you today?',
    'Where should we start?',
  ];
  const PRIVATE_GREETING = "What's on your mind today?";
  const IMAGINE_GREETING = 'What should we imagine today?';

  const EXPLAIN = [
    'Explain how neural networks learn',
    'Explain black holes in simple terms',
    'Explain the CAP theorem',
    'Explain how vaccines train the immune system',
  ];
  const SUGGESTIONS = [
    { icon: 'image', text: 'Create an image', prompt: 'Create an image of ' },
    { icon: 'video', text: 'Create a video', prompt: 'Create a short video of ' },
    { icon: 'pencil', text: 'Write or edit', prompt: 'Help me write ' },
    { icon: 'globe', text: 'Search the web', prompt: 'Search the web for ' },
    { icon: 'mail', text: 'Check email and calendar', send: true, prompt: "Summarize my unread email and today's calendar" },
    { icon: 'code', text: 'Debug some code', prompt: 'Help me debug this code:\n' },
  ];
  const IMAGINE_SUGGESTIONS = [
    { icon: 'image', text: 'A lighthouse at dusk, painted in oils', send: true },
    { icon: 'image', text: 'An isometric tiny city on a floating island', send: true },
    { icon: 'video', text: 'Slow-motion ocean wave at golden hour', send: true },
    { icon: 'image', text: 'A cozy reading nook in watercolor', send: true },
  ];
  const COMPLETE_EN = ['explained simply', 'step by step', 'with examples', 'pros and cons', 'for beginners', 'in 5 bullet points', 'history and background'];
  const COMPLETE_ZH = ['是什么意思', '的原理', '怎么入门', '的优缺点', '举个例子', '的发展历史', '常见误区'];
  const MODELS = ['Auto', 'Fast', 'Expert', 'Heavy', 'Build'];

  const BOTS = [
    { id: 'orbit', name: 'Orbit Bot', icon: 'orbit', bg: 'var(--fg)', fg: 'var(--bg)', pinned: true, greeting: 'What should we automate today?' },
    { id: 'trip', name: 'Trip Planner', icon: 'plane', bg: 'linear-gradient(135deg,#4aa8ff,#1167f2)', greeting: 'Where are we headed?' },
    { id: 'docs', name: 'Doc Writer', icon: 'doc', bg: 'linear-gradient(135deg,#39b8ff,#1184fe)', greeting: 'What are we writing today?' },
    { id: 'chef', name: 'Recipe Helper', icon: 'chef', bg: 'linear-gradient(135deg,#ffa94d,#f76b1c)', greeting: "What's cooking today?" },
    { id: 'math', name: 'Math Tutor', icon: 'sigma', bg: 'linear-gradient(135deg,#9a8cff,#5b4bdb)', greeting: 'Which problem are we solving?' },
  ];
  const PROJECTS = [{ id: 'p1', name: 'Research notes', icon: 'folder' }];

  function makeChats() {
    const now = Date.now();
    const H = 36e5;
    const D = 24 * H;
    const d = new Date(now - 2 * D);
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return [
      {
        id: 'c1', title: 'Weekend trip to Kyoto', updated: now - 4 * H,
        messages: [
          { role: 'user', text: 'Plan a relaxed two-day weekend in Kyoto' },
          { role: 'ai', text: "Here's an easygoing plan:\n\n### Day 1\n- **Morning:** Fushimi Inari early, before the crowds\n- **Afternoon:** Lunch near Gion, then a slow walk through Higashiyama\n- **Evening:** Dinner along Pontocho alley\n\n### Day 2\n- **Morning:** Arashiyama bamboo grove and Tenryu-ji\n- **Afternoon:** Matcha and a riverside break\n- **Evening:** Snacks at Nishiki Market\n\nWant me to add travel times between the spots?" },
        ],
      },
      {
        id: 'c2', title: `Chat on ${dateLabel}`, updated: now - 2 * D,
        messages: [
          { role: 'user', text: 'Summarize the key points of my meeting notes' },
          { role: 'ai', text: "Sure — paste the notes and I'll pull out the **decisions**, **owners** and **deadlines** as a short list." },
        ],
      },
      {
        id: 'c3', title: 'Explain transformers simply', updated: now - 2 * D - 3 * H,
        messages: [
          { role: 'user', text: "Explain transformers like I'm new to machine learning" },
          { role: 'ai', text: 'A transformer reads a whole sentence at once and works out **which words should pay attention to which**.\n\n- Each word becomes a list of numbers (a vector).\n- An attention step scores how relevant every other word is to it.\n- Stacking many of these layers lets the model build up meaning.\n\nThat one idea is the core of most modern language models.' },
        ],
      },
      {
        id: 'c4', title: 'Sourdough starter troubleshooting', updated: now - 3 * D,
        messages: [
          { role: 'user', text: 'My sourdough starter smells like nail polish' },
          { role: 'ai', text: "That sharp smell usually means it's **hungry**. Feed it more often (about every 12 hours), use a little more flour, and keep it somewhere slightly warmer. It should bounce back in two or three days." },
        ],
      },
      {
        id: 'c5', title: 'Regex for validating emails', updated: now - 5 * D,
        messages: [
          { role: 'user', text: 'Give me a simple regex for emails' },
          { role: 'ai', text: `A pragmatic pattern:\n\n${FENCE}regex\n^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$\n${FENCE}\n\nIt catches obvious typos without rejecting unusual but valid addresses. For real validation, send a confirmation email.` },
        ],
      },
      {
        id: 'c6', title: 'Picking a sci-fi book', updated: now - 8 * D,
        messages: [
          { role: 'user', text: 'Recommend a kind of sci-fi book for a long flight' },
          { role: 'ai', text: 'Depends on your mood:\n\n- **Hard science:** problem-solving stories where the physics matters\n- **Space opera:** big casts, empires and long journeys\n- **Near future:** grounded stories about technology a decade from now\n\nTell me one book you loved and I can narrow it down.' },
        ],
      },
      {
        id: 'c7', title: 'Fix CSS grid overflow', updated: now - 12 * D,
        messages: [
          { role: 'user', text: 'My CSS grid overflows on mobile' },
          { role: 'ai', text: `Usually a child with a long word or a wide image forces the track wider. Try:\n\n${FENCE}css\n.grid {\n  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));\n}\n.grid > * { min-width: 0; }\n${FENCE}\n\n\`min-width: 0\` lets grid items shrink below their content size.` },
        ],
      },
      {
        id: 'c8', title: 'Weekly workout plan', updated: now - 20 * D,
        messages: [
          { role: 'user', text: 'Make me a simple three-day workout plan' },
          { role: 'ai', text: '- **Monday:** full-body strength (squat, push-up, row)\n- **Wednesday:** 30 minutes of easy cardio plus core\n- **Friday:** full-body strength (deadlift, press, pull-up)\n\nWalk or rest on the other days.' },
        ],
      },
    ];
  }

  /* ================================================================== *
   * DOM refs & state
   * ================================================================== */
  const app = $('#app');
  const greetingEl = $('#greeting');
  const threadEl = $('#thread');
  const threadInner = $('#threadInner');
  const libraryEl = $('#library');
  const followupsEl = $('#followups');
  const composerRow = $('#composerRow');
  const composer = $('#composer');
  const input = $('#input');
  const actionBtn = $('#actionBtn');
  const micBtn = $('#micBtn');
  const modelBtn = $('#modelBtn');
  const modelLabel = $('#modelLabel');
  const plusBtn = $('#plusBtn');
  const suggestionsEl = $('#suggestions');
  const belowCol = $('#below .col');
  const privateBtn = $('#privateBtn');
  const accountBtn = $('#accountBtn');
  const fileInput = $('#fileInput');

  const state = {
    mode: 'home',          // home | chat | library
    variant: 'default',    // default | imagine | library
    private: false,
    model: store.get('orbit.model', 'Fast'),
    greeting: GREETINGS[0],
    suggestions: [],
    conv: null,
    stream: null,
    chats: makeChats(),
    activeId: null,
    showAllBots: false,
    showAllChats: false,
    theme: store.get('orbit.theme', 'system'),
  };
  if (!MODELS.includes(state.model)) state.model = 'Fast';

  /* ================================================================== *
   * Text morph — per-letter word swap used by the greeting.
   * Shared words stay put; the changed segment's letters rise out
   * (fading, tinted blue) and the new letters drop in 100ms later,
   * while the segment's width eases to the new word.
   * ================================================================== */
  class TextMorph {
    constructor(node) {
      this.node = node;
      this.text = '';
      this.timer = 0;
      this.layer = el('span', 'morph-anim');
      this.layer.setAttribute('aria-hidden', 'true');
      this.sizer = el('span', 'morph-sizer');
      this.sizer.setAttribute('aria-hidden', 'true');
      this.sr = el('span', 'sr-only');
      node.replaceChildren(this.layer, this.sizer, this.sr);
    }

    static diff(a, b) {
      const ta = a.split(/(\s+)/).filter(Boolean);
      const tb = b.split(/(\s+)/).filter(Boolean);
      let i = 0;
      while (i < ta.length && i < tb.length && ta[i] === tb[i]) i++;
      let j = 0;
      while (j < ta.length - i && j < tb.length - i && ta[ta.length - 1 - j] === tb[tb.length - 1 - j]) j++;
      return {
        head: tb.slice(0, i).join(''),
        from: ta.slice(i, ta.length - j).join(''),
        to: tb.slice(i, tb.length - j).join(''),
        tail: tb.slice(tb.length - j).join(''),
      };
    }

    static group(text, hidden, baseMs) {
      const g = el('span', 'morph-group' + (hidden ? ' off' : ''));
      g.style.setProperty('--base', baseMs + 'ms');
      Array.from(text).forEach((ch, i) => {
        const c = el('span', 'morph-ch', ch);
        c.style.setProperty('--i', i);
        g.append(c);
      });
      return g;
    }

    set(text, animate = true) {
      if (text === this.text) return;
      const prev = this.text;
      this.text = text;
      this.sr.textContent = text;
      this.sizer.textContent = text;
      clearTimeout(this.timer);
      if (!animate || !prev || motionOff() || !this.node.offsetParent) {
        this.layer.textContent = text;
        return;
      }
      const { head, from, to, tail } = TextMorph.diff(prev, text);
      const slot = el('span', 'morph-slot');
      const out = TextMorph.group(from, false, 0);
      const inn = TextMorph.group(to, true, 100);
      slot.append(out, inn);
      this.layer.replaceChildren(el('span', 'morph-fix', head), slot, el('span', 'morph-fix', tail));
      const w0 = out.getBoundingClientRect().width;
      const w1 = inn.getBoundingClientRect().width;
      slot.style.width = w0 + 'px';
      void slot.offsetWidth; // commit the starting state
      out.classList.add('off');
      inn.classList.remove('off');
      slot.style.width = w1 + 'px';
      const total = 100 + 260 + Math.max(from.length, to.length) * 6.667 + 80;
      this.timer = setTimeout(() => {
        out.remove();
        slot.style.width = '';
      }, total);
    }
  }
  let morph = null;

  /* ================================================================== *
   * Mode switching (home ↔ chat ↔ library) with a FLIP slide for the
   * composer between the centre of the screen and the bottom dock.
   * ================================================================== */
  function setMode(next) {
    if (state.mode === next) return;
    const before = composerRow.getBoundingClientRect();
    app.classList.add('no-trans');
    state.mode = next;
    app.dataset.mode = next;
    const after = composerRow.getBoundingClientRect();
    void app.offsetWidth;
    app.classList.remove('no-trans');
    const dy = before.top - after.top;
    if (before.height && after.height && Math.abs(dy) > 1 && !motionOff()) {
      composerRow.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
        { duration: 460, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      );
    }
    if (next !== 'chat') document.title = 'Orbit';
    updateAction();
  }

  function replayEnter() {
    if (motionOff()) return;
    const nodes = [greetingEl, composer, belowCol];
    nodes.forEach((n) => n.classList.remove('enter'));
    void app.offsetWidth;
    nodes.forEach((n) => n.classList.add('enter'));
  }
  [greetingEl, composer, belowCol].forEach((n) => {
    n.addEventListener('animationend', (e) => { if (e.target === n) n.classList.remove('enter'); });
  });

  function pickGreeting(prev) {
    return pick(GREETINGS.filter((g) => g !== prev));
  }

  function goHome({ variant = 'default', greeting } = {}) {
    cancelStream();
    stopDictation();
    closeMenu(true);
    state.conv = null;
    setActiveChat(null);
    if (state.private) setPrivate(false, { silent: true });
    state.variant = variant;
    updateNavActive();
    input.placeholder = variant === 'imagine' ? 'Describe an image or video...' : 'Ask, imagine, build anything...';
    setMode('home');
    threadInner.replaceChildren();
    clearFollowups();
    const next = greeting || (variant === 'imagine' ? IMAGINE_GREETING : pickGreeting(state.greeting));
    state.greeting = next;
    morph.set(next);
    pickSuggestions();
    renderBelow();
    replayEnter();
    if (mobileMQ.matches) closeMobileSidebar();
    else input.focus({ preventScroll: true });
  }

  function showLibrary() {
    cancelStream();
    stopDictation();
    state.conv = null;
    setActiveChat(null);
    if (state.private) setPrivate(false, { silent: true });
    state.variant = 'library';
    updateNavActive();
    setMode('library');
    clearFollowups();
    libraryEl.classList.remove('fade-in');
    void libraryEl.offsetWidth;
    libraryEl.classList.add('fade-in');
    if (mobileMQ.matches) closeMobileSidebar();
  }

  function updateNavActive() {
    $$('.sb-nav .sb-item').forEach((b) => b.classList.toggle('active', b.dataset.nav === state.variant));
  }

  /* ================================================================== *
   * Private mode
   * ================================================================== */
  function setPrivate(on, { silent = false } = {}) {
    closeMenu(true);
    state.private = on;
    app.classList.toggle('private', on);
    privateBtn.setAttribute('aria-pressed', String(on));
    privateBtn.setAttribute('aria-label', on ? 'Switch to Normal Chat' : 'Switch to Private Chat');
    if (!silent) morph.set(on ? PRIVATE_GREETING : state.greeting);
    updateAction();
    renderBelow();
  }

  /* ================================================================== *
   * Suggestions & autocomplete rows under the composer
   * ================================================================== */
  function pickSuggestions() {
    state.suggestions = state.variant === 'imagine'
      ? shuffle(IMAGINE_SUGGESTIONS).slice(0, 3)
      : [{ icon: 'bubbles', text: pick(EXPLAIN), send: true }, ...shuffle(SUGGESTIONS).slice(0, 2)];
  }

  function completionsFor(q) {
    const base = q.replace(/\s+$/, '');
    const zh = hasCJK(base);
    const list = zh ? COMPLETE_ZH : COMPLETE_EN;
    const start = Array.from(base).length % list.length;
    return [0, 1, 2].map((k) => ({
      icon: 'search',
      typed: base,
      rest: (zh ? '' : ' ') + list[(start + k * 2) % list.length],
      send: true,
    }));
  }

  function renderBelow() {
    if (state.mode !== 'home') return;
    const q = input.value;
    const rows = q.trim() ? completionsFor(q) : state.suggestions;
    suggestionsEl.replaceChildren(...rows.map((s) => {
      const b = el('button', 'sugg');
      b.type = 'button';
      const label = s.typed != null ? `<span class="typed">${esc(s.typed)}</span>${esc(s.rest)}` : esc(s.text);
      b.innerHTML = `<span class="ib">${icon(s.icon)}</span><span class="txt">${label}</span>`;
      b.addEventListener('click', () => {
        const value = s.typed != null ? s.typed + s.rest : (s.prompt || s.text);
        if (s.send) send(value);
        else setInput(value);
      });
      return b;
    }));
  }

  /* ================================================================== *
   * Composer
   * ================================================================== */
  function autoresize() {
    // An empty field stays one line tall even if the placeholder would wrap.
    if (!input.value) {
      input.style.height = '24px';
      input.style.overflowY = 'hidden';
      return;
    }
    input.style.height = 'auto';
    const h = Math.min(input.scrollHeight, 216);
    input.style.height = h + 'px';
    input.style.overflowY = input.scrollHeight > 216 ? 'auto' : 'hidden';
  }

  function onInput() {
    autoresize();
    updateAction();
    renderBelow();
  }

  function setInput(value) {
    input.value = value;
    onInput();
    input.focus();
    input.setSelectionRange(value.length, value.length);
  }

  const ACTIONS = {
    voice: { icon: 'wave', label: 'Voice mode', tip: 'Voice mode' },
    send: { icon: 'arrowUp', label: 'Send', tip: 'Send' },
    'send-off': { icon: 'arrowUp', label: 'Send', tip: '' },
    stop: { icon: 'stop', label: 'Stop', tip: 'Stop' },
  };
  function updateAction() {
    const hasText = input.value.trim().length > 0;
    let kind = 'voice';
    if (state.stream) kind = 'stop';
    else if (hasText) kind = 'send';
    else if (state.private) kind = 'send-off';
    if (actionBtn.dataset.kind === kind) return;
    const a = ACTIONS[kind];
    actionBtn.dataset.kind = kind;
    actionBtn.className = 'c-btn c-action ' + kind;
    actionBtn.innerHTML = icon(a.icon);
    actionBtn.setAttribute('aria-label', a.label);
    if (a.tip) actionBtn.dataset.tip = a.tip;
    else delete actionBtn.dataset.tip;
    actionBtn.disabled = kind === 'send-off';
  }

  function setModel(m) {
    state.model = m;
    modelLabel.textContent = m;
    modelBtn.setAttribute('aria-label', 'Model: ' + m);
    store.set('orbit.model', m);
  }

  /* ================================================================== *
   * Chat thread
   * ================================================================== */
  function makeTitle(text) {
    const line = text.split('\n')[0].replace(/\s+/g, ' ').trim();
    const t = line.length > 40 ? line.slice(0, 38).trimEnd() + '…' : line;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  async function send(raw) {
    const text = String(raw || '').trim();
    if (!text || state.stream) return;
    closeMenu(true);
    hideTip();
    stopDictation();
    input.value = '';
    autoresize();
    clearFollowups();

    if (state.mode !== 'chat') {
      state.conv = { id: 'n' + Date.now(), title: makeTitle(text), messages: [], private: state.private, updated: Date.now() };
      setMode('chat');
      threadInner.replaceChildren();
      if (!state.conv.private) {
        state.chats.unshift(state.conv);
        state.activeId = state.conv.id;
        renderChats(state.conv.id);
      }
    }
    const conv = state.conv;
    document.title = `${conv.title} - Orbit`;
    conv.messages.push({ role: 'user', text });
    conv.updated = Date.now();
    threadInner.append(userMsg(text, true));
    scrollThread(true);

    const reply = composeReply(text);
    const res = await streamReply(reply);
    if (state.conv !== conv || res.cancelled) return;
    conv.messages.push({ role: 'ai', text: reply.text });
    if (!res.stopped && reply.followups) showFollowups(reply.followups);
  }

  function userMsg(text, animate) {
    const row = el('div', 'msg-user' + (animate && !motionOff() ? ' enter' : ''));
    row.append(el('div', 'bubble', text));
    return row;
  }

  function scrollThread(force) {
    const near = threadEl.scrollHeight - threadEl.scrollTop - threadEl.clientHeight < 160;
    if (force || near) threadEl.scrollTop = threadEl.scrollHeight;
  }

  function streamReply(reply) {
    const wrap = el('div', 'msg-ai');
    const thinking = el('div', 'thinking');
    thinking.innerHTML = `${icon('sparkle')}<span class="shimmer">Thinking</span>`;
    wrap.append(thinking);
    threadInner.append(wrap);
    scrollThread(true);

    return new Promise((resolve) => {
      const s = { timer: 0, done: false };
      state.stream = s;
      updateAction();
      const md = el('div', 'md');
      let queue = [];
      let i = 0;

      const finish = (stopped) => {
        if (s.done) return;
        s.done = true;
        clearTimeout(s.timer);
        thinking.remove();
        if (!md.isConnected) wrap.append(md);
        if (stopped && !md.textContent.trim()) md.append(el('p', 'stopped', 'Response stopped.'));
        wrap.append(actionsRow(reply.text));
        state.stream = null;
        updateAction();
        if (settings.autoScroll) scrollThread();
        if (!stopped) notifyDone(reply.text);
        resolve({ stopped });
      };
      s.stop = () => finish(true);
      s.cancel = () => {
        if (s.done) return;
        s.done = true;
        clearTimeout(s.timer);
        state.stream = null;
        updateAction();
        resolve({ stopped: true, cancelled: true });
      };

      const tick = () => {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n && i < queue.length; k++) queue[i++]();
        if (settings.autoScroll) scrollThread();
        if (i < queue.length) s.timer = setTimeout(tick, 24 + Math.random() * 36);
        else finish(false);
      };
      s.timer = setTimeout(() => {
        thinking.remove();
        wrap.append(md);
        queue = buildQueue(parseBlocks(reply.text), md);
        tick();
      }, reply.think != null ? reply.think : 650 + Math.random() * 650);
    });
  }

  function stopStream() { if (state.stream) state.stream.stop(); }
  function cancelStream() { if (state.stream) state.stream.cancel(); }

  /* ---------- Minimal markdown: paragraphs, ### headings, lists, code ---------- */
  function parseBlocks(src) {
    const lines = src.split('\n');
    const blocks = [];
    const isSpecial = (l) => /^(```|#{1,3}\s|\s*[-*]\s|\s*\d+\.\s)/.test(l);
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith(FENCE)) {
        const lang = line.slice(3).trim();
        const code = [];
        i++;
        while (i < lines.length && !lines[i].startsWith(FENCE)) code.push(lines[i++]);
        i++;
        blocks.push({ type: 'code', lang, text: code.join('\n') });
      } else if (/^#{1,3}\s/.test(line)) {
        blocks.push({ type: 'h', text: line.replace(/^#{1,3}\s/, '') });
        i++;
      } else if (/^\s*[-*]\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s/, ''));
        blocks.push({ type: 'ul', items });
      } else if (/^\s*\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s/, ''));
        blocks.push({ type: 'ol', items });
      } else if (!line.trim()) {
        i++;
      } else {
        const para = [];
        while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) para.push(lines[i++]);
        blocks.push({ type: 'p', text: para.join(' ') });
      }
    }
    return blocks;
  }

  function inlineSegments(text) {
    const segs = [];
    const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > last) segs.push({ t: text.slice(last, m.index) });
      const s = m[0];
      segs.push(s.startsWith('**') ? { t: s.slice(2, -2), b: true } : { t: s.slice(1, -1), c: true });
      last = re.lastIndex;
    }
    if (last < text.length) segs.push({ t: text.slice(last) });
    return segs;
  }

  const splitTokens = (t) => t.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+\s*|\s+/g) || [];

  function pushInline(q, text, parent) {
    for (const seg of inlineSegments(text)) {
      const tokens = seg.c ? [seg.t] : splitTokens(seg.t);
      for (const tk of tokens) {
        q.push(() => {
          const n = el(seg.b ? 'strong' : seg.c ? 'code' : 'span', 'tok', tk);
          parent().append(n);
        });
      }
    }
  }

  function buildQueue(blocks, root) {
    const q = [];
    for (const b of blocks) {
      if (b.type === 'code') {
        let code = null;
        q.push(() => { const cb = codeBlock(b.lang); root.append(cb.el); code = cb.code; });
        const lines = b.text.split('\n');
        lines.forEach((ln, idx) => q.push(() => code.append(el('span', 'tok', ln + (idx < lines.length - 1 ? '\n' : '')))));
      } else if (b.type === 'ul' || b.type === 'ol') {
        let list = null;
        q.push(() => { list = el(b.type); root.append(list); });
        for (const item of b.items) {
          let li = null;
          q.push(() => { li = el('li'); list.append(li); });
          pushInline(q, item, () => li);
        }
      } else {
        let node = null;
        q.push(() => { node = el(b.type === 'h' ? 'h3' : 'p'); root.append(node); });
        pushInline(q, b.text, () => node);
      }
    }
    return q;
  }

  function renderStatic(src) {
    const md = el('div', 'md static');
    buildQueue(parseBlocks(src), md).forEach((f) => f());
    return md;
  }

  function codeBlock(lang) {
    const wrap = el('div', 'codeblock');
    wrap.innerHTML = `<div class="cb-head"><span>${esc(lang || 'code')}</span><button class="cb-copy" type="button">${icon('copy')}<span>Copy</span></button></div><pre><code></code></pre>`;
    const code = wrap.querySelector('code');
    const btn = wrap.querySelector('.cb-copy');
    btn.addEventListener('click', () => {
      copyText(code.textContent);
      btn.lastElementChild.textContent = 'Copied';
      setTimeout(() => { btn.lastElementChild.textContent = 'Copy'; }, 1400);
    });
    return { el: wrap, code };
  }

  function actionsRow(text) {
    const row = el('div', 'msg-actions');
    const defs = [['copy', 'Copy'], ['thumbUp', 'Good response'], ['thumbDown', 'Bad response'], ['more', 'More']];
    row.innerHTML = defs.map(([ic, label]) => `<button type="button" class="act" data-act="${ic}" aria-label="${label}" data-tip="${label}">${icon(ic)}</button>`).join('');
    row.addEventListener('click', (e) => {
      const b = e.target.closest('.act');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'copy') {
        copyText(text);
        b.innerHTML = icon('check');
        setTimeout(() => { b.innerHTML = icon('copy'); }, 1400);
      } else if (act === 'thumbUp' || act === 'thumbDown') {
        const on = !b.classList.contains('on');
        $$('.act[data-act^="thumb"]', row).forEach((x) => x.classList.remove('on'));
        b.classList.toggle('on', on);
        if (on) toast('Thanks for the feedback');
      } else if (act === 'more') {
        toggleMenu(b, () => [
          { icon: 'refresh', label: 'Regenerate', action: () => regenerate(row) },
          { icon: 'volume', label: 'Read aloud', action: () => speak(text) },
          { icon: 'share', label: 'Share', action: share },
        ], { align: 'left', keyboard: e.detail === 0 });
      }
    });
    return row;
  }

  async function regenerate(row) {
    const conv = state.conv;
    const wrap = row.closest('.msg-ai');
    if (!conv || state.stream || !wrap) return;
    if (wrap !== threadInner.lastElementChild) { toast('Only the latest response can be regenerated'); return; }
    const lastUser = [...conv.messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    if (conv.messages.length && conv.messages[conv.messages.length - 1].role === 'ai') conv.messages.pop();
    wrap.remove();
    clearFollowups();
    const reply = composeReply(lastUser.text);
    const res = await streamReply(reply);
    if (state.conv !== conv || res.cancelled) return;
    conv.messages.push({ role: 'ai', text: reply.text });
    if (!res.stopped && reply.followups) showFollowups(reply.followups);
  }

  function showFollowups(list) {
    followupsEl.replaceChildren(...list.map((t, i) => {
      const b = el('button', 'chip' + (motionOff() ? '' : ' enter'));
      b.type = 'button';
      b.style.setProperty('--d', 60 + i * 50 + 'ms');
      b.innerHTML = `<span class="play">${icon('play')}</span><span>${esc(t)}</span>`;
      b.addEventListener('mouseenter', () => highlightChip(b));
      b.addEventListener('focus', () => highlightChip(b));
      b.addEventListener('click', () => send(t));
      b.addEventListener('animationend', () => b.classList.remove('enter'), { once: true });
      return b;
    }));
    highlightChip(followupsEl.firstElementChild);
    scrollThread(true);
  }
  function highlightChip(chip) {
    $$('.chip', followupsEl).forEach((c) => c.classList.toggle('hl', c === chip));
  }
  function clearFollowups() { followupsEl.replaceChildren(); }

  function openChat(id) {
    const c = state.chats.find((x) => x.id === id);
    if (!c) return;
    cancelStream();
    stopDictation();
    closeMenu(true);
    if (state.private) setPrivate(false, { silent: true });
    state.conv = c;
    state.variant = 'default';
    updateNavActive();
    setMode('chat');
    document.title = `${c.title} - Orbit`;
    clearFollowups();
    threadInner.replaceChildren(...c.messages.map((m) => {
      if (m.role === 'user') return userMsg(m.text, false);
      const w = el('div', 'msg-ai');
      w.append(renderStatic(m.text), actionsRow(m.text));
      return w;
    }));
    threadInner.classList.remove('fade-in');
    void threadInner.offsetWidth;
    threadInner.classList.add('fade-in');
    setActiveChat(id);
    requestAnimationFrame(() => { threadEl.scrollTop = threadEl.scrollHeight; });
    if (mobileMQ.matches) closeMobileSidebar();
    else input.focus({ preventScroll: true });
  }

  /* ================================================================== *
   * Simulated replies (swap composeReply for a real API call)
   * ================================================================== */
  // Turn "Explain how rainbows form" into "how rainbows form", etc.
  function topicOf(t, kind) {
    let s = t.replace(/\s+/g, ' ').replace(/[?？!！.。]+$/, '').trim();
    const rules = kind === 'image'
      ? [
        /^(please\s+|can you\s+|could you\s+)/i,
        /^(create|generate|make|draw|paint|render|design)\s+(me\s+)?(an?\s+)?((short\s+)?(image|picture|photo|video|illustration|drawing|painting|logo|poster)\s+)?(of\s+)?/i,
        /^(请|麻烦)?(帮我)?(画|生成|做|设计)(一张|一幅|一个|一段|个|张)?(图片|图|照片|视频|插画|海报)?/,
      ]
      : [
        /^(please\s+|can you\s+|could you\s+)/i,
        /^(explain|describe|tell me about|teach me|help me understand|what is|what are|what's|give me an overview of|summari[sz]e)\s+/i,
        /^(请|麻烦)?(帮我)?(解释一下|解释|介绍一下|介绍|讲讲|说说|什么是|总结一下)/,
      ];
    for (const re of rules) {
      const next = s.replace(re, '').trim();
      if (next) s = next;
    }
    return s.length > 60 ? s.slice(0, 58).trimEnd() + '…' : s;
  }

  function composeReply(q) {
    const t = q.trim();
    const zh = hasCJK(t);
    const topic = topicOf(t);
    const greetingRe = /^(hi|hello|hey|yo|hiya|howdy|good (morning|afternoon|evening))\b[\s!.?]*$/i;
    const greetingZh = /^(你好|您好|嗨|哈喽|在吗|早上好|晚上好)[\s!！。?？]*$/;
    if (greetingRe.test(t) || greetingZh.test(t)) {
      return zh
        ? { text: '你好！今天想聊点什么？', followups: ['给我讲个冷知识', '帮我规划一下今天'], think: 500 }
        : { text: pick(['Hi! How can I help you today?', 'Hey there! What can I do for you?']), followups: ['Tell me a fun fact', 'Help me plan my day'], think: 500 };
    }
    const wantsImage = state.variant === 'imagine' || /\b(image|picture|photo|draw|paint|illustration|video|logo)\b/i.test(t) || /(图片|画|照片|视频|插画|海报)/.test(t);
    if (wantsImage) {
      const subject = topicOf(t, 'image');
      return zh ? imageZh(subject) : imageEn(subject);
    }
    const wantsCode = /\b(code|debug|bug|function|javascript|typescript|python|css|html|regex|error|api|sql)\b/i.test(t) || /(代码|编程|报错|函数|调试|前端|后端)/.test(t);
    if (wantsCode) return zh ? codeZh() : codeEn();
    return zh ? genericZh(topic) : genericEn(topic);
  }

  function genericEn(topic) {
    return {
      text: [
        `Here's a quick way to think about **${topic}**:`,
        '',
        '- **Start with the core idea.** Strip the question down to its simplest form and make sure that part is solid before adding detail.',
        '- **Look at a concrete example.** One worked case usually explains more than a page of definitions.',
        '- **Check the edge cases.** Ask where the idea stops working — that is often where the interesting parts are.',
        '',
        'Want me to go deeper on any of these, or walk through an example together?',
        '',
        'Note: this is a UI demo, so replies are simulated in the browser.',
      ].join('\n'),
      followups: ['Walk me through an example', 'Go deeper on the core idea'],
    };
  }

  function genericZh(topic) {
    return {
      text: [
        `关于**${topic}**，可以这样来理解：`,
        '',
        '- **先抓核心。** 把问题简化到最基本的形式，先把这一部分弄清楚，再去补充细节。',
        '- **看一个具体例子。** 一个完整的例子，往往比一大段定义更好懂。',
        '- **想想边界情况。** 想想这个思路在什么情况下会失效——有意思的地方往往就在那里。',
        '',
        '需要我针对其中某一点展开讲讲，或者一起看一个例子吗？',
        '',
        '提示：这是一个界面演示，回复内容由浏览器本地模拟生成。',
      ].join('\n'),
      followups: ['举个具体的例子', '再深入讲讲核心思路'],
    };
  }

  const DEBOUNCE_SNIPPET = [
    'function debounce(fn, wait = 200) {',
    '  let timer;',
    '  return (...args) => {',
    '    clearTimeout(timer);',
    '    timer = setTimeout(() => fn(...args), wait);',
    '  };',
    '}',
    '',
    'const onSearch = debounce((query) => {',
    "  console.log('Searching for', query);",
    '}, 300);',
  ].join('\n');

  function codeEn() {
    return {
      text: [
        'Happy to help. While you grab the code, here is a small pattern that fixes a lot of "it runs too often" bugs — **debounce** expensive work so it only runs after the user pauses:',
        '',
        FENCE + 'js',
        DEBOUNCE_SNIPPET,
        FENCE,
        '',
        'A few things to check while debugging:',
        '',
        '1. Reproduce the issue with the smallest possible input.',
        '2. Log the values going **in** and coming **out** of the suspicious function.',
        '3. Change one thing at a time and re-run.',
        '',
        "Paste the code and the exact error message, and I'll take a closer look.",
      ].join('\n'),
      followups: ['Explain how debounce works', 'Show the same thing in Python'],
    };
  }

  function codeZh() {
    return {
      text: [
        '没问题。先分享一个能解决很多"执行太频繁"类问题的小技巧——给耗时操作加**防抖**，让它只在用户停下来之后才执行：',
        '',
        FENCE + 'js',
        DEBOUNCE_SNIPPET,
        FENCE,
        '',
        '排查问题时可以按这个顺序：',
        '',
        '1. 用最小的输入复现问题。',
        '2. 在可疑函数的**输入**和**输出**处打印日志。',
        '3. 每次只改一处，然后重新运行。',
        '',
        '把代码和完整的报错信息贴过来，我帮你仔细看看。',
      ].join('\n'),
      followups: ['解释一下防抖的原理', '换成 Python 写法'],
    };
  }

  function imageEn(topic) {
    return {
      text: [
        `Image generation isn't connected in this demo, but here's a sharper prompt for **${topic}**:`,
        '',
        `- **Subject:** ${topic}`,
        '- **Light:** soft late-afternoon light with long shadows',
        '- **Lens:** 35mm, shallow depth of field',
        '- **Composition:** subject slightly off-centre, plenty of negative space',
        '- **Mood:** calm and cinematic',
        '',
        'Tip: describing light and lens usually changes the result more than adding adjectives.',
      ].join('\n'),
      followups: ['Make it more dramatic', 'Try a watercolor style'],
    };
  }

  function imageZh(topic) {
    return {
      text: [
        `这个演示没有接入图像生成，不过可以把**${topic}**的提示词写得更具体一些：`,
        '',
        `- **主体：** ${topic}`,
        '- **光线：** 傍晚柔和的侧光，影子拉长',
        '- **镜头：** 35mm，浅景深',
        '- **构图：** 主体略偏离中心，留出大量空白',
        '- **氛围：** 安静、有电影感',
        '',
        '小技巧：描述光线和镜头，往往比堆形容词更能改变效果。',
      ].join('\n'),
      followups: ['更有戏剧感一点', '换成水彩风格'],
    };
  }

  /* ================================================================== *
   * Sidebar lists
   * ================================================================== */
  function collapsible(items, open, onToggle) {
    const col = el('div', 'collapse' + (open ? ' open' : ''));
    const inner = el('div', 'collapse-inner');
    inner.append(...items);
    col.append(inner);
    col.inert = !open;
    const more = el('button', 'sb-item muted');
    more.type = 'button';
    more.innerHTML = `<span class="sb-spacer"></span><span class="label">${open ? 'Show less' : 'Show more'}</span>`;
    more.addEventListener('click', () => {
      const now = !col.classList.contains('open');
      col.classList.toggle('open', now);
      col.inert = !now;
      more.querySelector('.label').textContent = now ? 'Show less' : 'Show more';
      onToggle(now);
    });
    return [col, more];
  }

  function renderBots() {
    const list = $('#botList');
    const rows = BOTS.map(botRow);
    list.replaceChildren(...rows.slice(0, 3));
    if (rows.length > 3) list.append(...collapsible(rows.slice(3), state.showAllBots, (v) => { state.showAllBots = v; }));
  }

  function botRow(b) {
    const row = el('div', 'sb-row');
    row.innerHTML = `<button type="button" class="sb-item"><span class="bot-av" style="background:${b.bg}${b.fg ? `;color:${b.fg}` : ''}">${icon(b.icon)}</span><span class="label">${esc(b.name)}</span>${b.pinned ? `<span class="trail">${icon('pin')}</span>` : ''}</button><button type="button" class="row-more" aria-label="Actions for ${esc(b.name)}" aria-expanded="false">${icon('more')}</button>`;
    row.firstElementChild.addEventListener('click', () => goHome({ greeting: b.greeting }));
    row.lastElementChild.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(e.currentTarget, () => [
        { icon: 'pin', label: b.pinned ? 'Unpin' : 'Pin', action: () => { b.pinned = !b.pinned; renderBots(); } },
        { icon: 'pencil', label: 'Edit bot', action: () => toast("Bot editing isn't available in this demo") },
      ], { align: 'left', keyboard: e.detail === 0 });
    });
    return row;
  }

  function renderProjects() {
    $('#projectList').replaceChildren(...PROJECTS.map((p) => {
      const b = el('button', 'sb-item');
      b.type = 'button';
      b.innerHTML = `${icon(p.icon)}<span class="label">${esc(p.name)}</span>`;
      b.addEventListener('click', () => toast("Projects aren't available in this demo"));
      return b;
    }));
  }

  function renderChats(animateId) {
    const list = $('#chatList');
    const rows = state.chats.map(chatRow);
    list.replaceChildren(...rows.slice(0, 5));
    if (rows.length > 5) list.append(...collapsible(rows.slice(5), state.showAllChats, (v) => { state.showAllChats = v; }));
    setActiveChat(state.activeId);
    if (animateId && !motionOff()) {
      const row = list.querySelector(`[data-id="${animateId}"]`);
      if (row) {
        row.style.overflow = 'hidden';
        row.animate([{ height: '0px', opacity: 0 }, { height: '40px', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.22, 1, .36, 1)' })
          .onfinish = () => { row.style.overflow = ''; };
      }
    }
  }

  function chatRow(c) {
    const row = el('div', 'sb-row');
    row.dataset.id = c.id;
    row.innerHTML = `<button type="button" class="sb-item"><span class="label">${esc(c.title)}</span></button><button type="button" class="row-more" aria-label="Actions for ${esc(c.title)}" aria-expanded="false">${icon('more')}</button>`;
    row.firstElementChild.addEventListener('click', () => openChat(c.id));
    row.lastElementChild.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(e.currentTarget, () => [
        { icon: 'share', label: 'Share', action: share },
        { icon: 'pencil', label: 'Rename', action: () => renameChat(c.id) },
        'sep',
        { icon: 'trash', label: 'Delete', danger: true, action: () => deleteChat(c.id) },
      ], { align: 'left', keyboard: e.detail === 0 });
    });
    return row;
  }

  function setActiveChat(id) {
    state.activeId = id;
    $$('#chatList .sb-row').forEach((r) => {
      const item = r.firstElementChild;
      if (item) item.classList.toggle('active', r.dataset.id === id);
    });
  }

  function renameChat(id) {
    const c = state.chats.find((x) => x.id === id);
    const row = $(`#chatList [data-id="${id}"]`);
    if (!c || !row) return;
    const holder = el('div', 'sb-item renaming');
    const field = el('input', 'rename');
    field.value = c.title;
    field.setAttribute('aria-label', 'Chat title');
    holder.append(field);
    row.firstElementChild.replaceWith(holder);
    field.focus();
    field.select();
    const commit = (save) => {
      if (!holder.isConnected) return;
      if (save && field.value.trim()) {
        c.title = field.value.trim();
        if (state.conv === c) document.title = `${c.title} - Orbit`;
      }
      renderChats();
    };
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) commit(true);
      else if (e.key === 'Escape') { e.stopPropagation(); commit(false); }
    });
    field.addEventListener('blur', () => commit(true));
  }

  function deleteChat(id) {
    const row = $(`#chatList [data-id="${id}"]`);
    const done = () => {
      state.chats = state.chats.filter((x) => x.id !== id);
      if (state.conv && state.conv.id === id) goHome();
      renderChats();
      toast('Chat deleted');
    };
    if (row && !motionOff()) {
      row.style.overflow = 'hidden';
      row.animate([{ height: row.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 200, easing: 'cubic-bezier(.2, 0, 0, 1)' }).onfinish = done;
    } else {
      done();
    }
  }

  /* ================================================================== *
   * Menus (popovers)
   * ================================================================== */
  let openMenu = null;

  function showMenu(anchor, items, opts = {}) {
    closeMenu(true);
    hideTip();
    const m = el('div', 'menu');
    m.setAttribute('role', 'menu');
    for (const it of items) {
      if (it === 'sep') { m.append(el('div', 'menu-sep')); continue; }
      if (it.header) { m.append(el('div', 'menu-label', it.label)); continue; }
      if (it.profile) {
        const p = el('div', 'menu-profile');
        p.innerHTML = `<div class="mp-name">${esc(it.name)}</div><div class="mp-email">${esc(it.email)}</div>`;
        m.append(p, el('div', 'menu-sep'));
        continue;
      }
      const b = el('button', 'menu-item' + (it.danger ? ' danger' : ''));
      b.type = 'button';
      if (it.checked != null) {
        b.setAttribute('role', 'menuitemradio');
        b.setAttribute('aria-checked', String(!!it.checked));
      } else {
        b.setAttribute('role', 'menuitem');
      }
      b.innerHTML = `${it.icon ? icon(it.icon) : ''}<span class="mi-label">${esc(it.label)}</span>${it.hint ? `<span class="mi-hint">${esc(it.hint)}</span>` : ''}${it.trail ? icon(it.trail, 'mi-trail') : ''}${it.checked ? icon('check', 'mi-check') : ''}`;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
        if (it.action) it.action();
      });
      m.append(b);
    }
    document.body.append(m);

    const r = anchor.getBoundingClientRect();
    const mw = m.offsetWidth;
    const mh = m.offsetHeight;
    const spaceBelow = innerHeight - r.bottom;
    const up = spaceBelow < mh + 16 && r.top > spaceBelow;
    const alignRight = opts.align === 'right';
    const left = Math.min(innerWidth - mw - 8, Math.max(8, alignRight ? r.right - mw : r.left));
    m.style.left = left + 'px';
    if (up) m.style.bottom = innerHeight - r.top + 7 + 'px';
    else m.style.top = r.bottom + 7 + 'px';
    m.style.transformOrigin = `${alignRight ? 'right' : 'left'} ${up ? 'bottom' : 'top'}`;

    anchor.setAttribute('aria-expanded', 'true');
    openMenu = { el: m, anchor };
    requestAnimationFrame(() => m.classList.add('open'));
    if (opts.keyboard) {
      const first = m.querySelector('.menu-item');
      if (first) first.focus();
    }
  }

  function closeMenu(instant) {
    if (!openMenu) return;
    const { el: m, anchor } = openMenu;
    openMenu = null;
    anchor.setAttribute('aria-expanded', 'false');
    if (instant) { m.remove(); return; }
    m.classList.remove('open');
    setTimeout(() => m.remove(), 140);
  }

  function toggleMenu(anchor, build, opts) {
    if (openMenu && openMenu.anchor === anchor) { closeMenu(); return; }
    showMenu(anchor, build(), opts);
  }

  function menuKeys(e) {
    const items = $$('.menu-item', openMenu.el);
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const a = openMenu.anchor;
      closeMenu();
      a.focus();
    } else if (e.key === 'Tab') {
      closeMenu(true);
    }
  }

  document.addEventListener('pointerdown', (e) => {
    if (openMenu && !openMenu.el.contains(e.target) && !openMenu.anchor.contains(e.target)) closeMenu();
  });
  window.addEventListener('resize', () => closeMenu(true));

  /* ================================================================== *
   * Command palette
   * ================================================================== */
  const palette = $('#palette');
  const palInput = $('#palInput');
  const palTabsEl = $('#palTabs');
  const palList = $('#palList');
  const PAL_TABS = ['All', 'Imagine', 'Apps', 'Automations', 'Files'];
  let palTab = 'All';
  let palIdx = 0;
  let palRows = [];
  let palPrevFocus = null;
  let palCloseTimer = 0;

  function relTime(ts) {
    const s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return 'now';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 604800) return Math.floor(s / 86400) + 'd';
    return Math.floor(s / 604800) + 'w';
  }

  function paletteItems() {
    const actions = [
      { icon: 'plus', label: 'New Chat', keys: [MOD, 'J'], tabs: ['All'], run: () => goHome() },
      { icon: 'folderPlus', label: 'New Project', tabs: ['All'], run: () => toast("Projects aren't available in this demo") },
      { icon: 'bolt', label: 'New Automation', tabs: ['All', 'Automations'], run: () => openSettings('automations') },
      { icon: 'gear', label: 'Open settings', keys: [MOD, ','], tabs: ['All'], run: () => openSettings() },
      { icon: 'image', label: 'Create an image', tabs: ['Imagine'], run: () => goHome({ variant: 'imagine' }) },
      { icon: 'video', label: 'Create a video', tabs: ['Imagine'], run: () => { goHome({ variant: 'imagine' }); setInput('Create a short video of '); } },
      { icon: 'apps', label: 'Connect an app', tabs: ['Apps'], run: () => openSettings('apps') },
    ];
    const chats = state.chats.map((c) => ({ icon: 'chat', label: c.title, meta: relTime(c.updated), tabs: ['All'], run: () => openChat(c.id) }));
    return { actions, chats };
  }

  function markText(label, q) {
    if (!q) return esc(label);
    const i = label.toLowerCase().indexOf(q);
    if (i < 0) return esc(label);
    return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + q.length)) + '</mark>' + esc(label.slice(i + q.length));
  }

  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    const { actions, chats } = paletteItems();
    const ok = (it) => it.tabs.includes(palTab) && (!q || it.label.toLowerCase().includes(q));
    const a = actions.filter(ok);
    const c = chats.filter(ok);
    palList.replaceChildren();
    palRows = [];
    const add = (it) => {
      const b = el('button', 'pal-row');
      b.type = 'button';
      b.setAttribute('role', 'option');
      const keys = it.keys ? `<span class="pal-keys">${it.keys.map((k) => `<kbd class="kbd">${esc(k)}</kbd>`).join('')}</span>` : '';
      const meta = it.meta ? `<span class="pal-meta">${esc(it.meta)}</span>` : '';
      b.innerHTML = `${icon(it.icon)}<span class="pal-label">${markText(it.label, q)}</span>${keys}${meta}`;
      const idx = palRows.length;
      b.addEventListener('mousemove', () => { if (palIdx !== idx) { palIdx = idx; markPal(false); } });
      b.addEventListener('click', () => { closePalette(); it.run(); });
      palRows.push(b);
      palList.append(b);
    };
    a.forEach(add);
    if (c.length) {
      palList.append(el('div', 'pal-section', 'Chats'));
      c.forEach(add);
    }
    if (!palRows.length) palList.append(el('div', 'pal-empty', q ? 'No results' : 'Nothing here yet'));
    palIdx = 0;
    markPal(true);
  }

  function markPal(scroll) {
    palRows.forEach((r, i) => r.classList.toggle('sel', i === palIdx));
    if (scroll && palRows[palIdx]) palRows[palIdx].scrollIntoView({ block: 'nearest' });
  }

  function renderPalTabs() {
    palTabsEl.replaceChildren(...PAL_TABS.map((t) => {
      const b = el('button', 'pal-tab' + (t === palTab ? ' active' : ''), t);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(t === palTab));
      b.addEventListener('click', () => {
        palTab = t;
        renderPalTabs();
        renderPalette();
        palInput.focus();
      });
      return b;
    }));
  }

  function openPalette() {
    if (!palette.hidden && palette.classList.contains('open')) return;
    clearTimeout(palCloseTimer);
    closeMenu(true);
    hideTip();
    palPrevFocus = document.activeElement;
    palTab = 'All';
    palInput.value = '';
    renderPalTabs();
    renderPalette();
    palette.hidden = false;
    void palette.offsetWidth;
    palette.classList.add('open');
    palInput.focus();
  }

  function closePalette() {
    if (palette.hidden || !palette.classList.contains('open')) return;
    palette.classList.remove('open');
    palCloseTimer = setTimeout(() => { palette.hidden = true; }, 160);
    if (palPrevFocus && palPrevFocus.focus) palPrevFocus.focus({ preventScroll: true });
  }

  palInput.addEventListener('input', renderPalette);
  palInput.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!palRows.length) return;
      palIdx = (palIdx + (e.key === 'ArrowDown' ? 1 : palRows.length - 1)) % palRows.length;
      markPal(true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (palRows[palIdx]) palRows[palIdx].click();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const i = PAL_TABS.indexOf(palTab);
      palTab = PAL_TABS[(i + (e.shiftKey ? PAL_TABS.length - 1 : 1)) % PAL_TABS.length];
      renderPalTabs();
      renderPalette();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette();
    }
  });
  palette.addEventListener('mousedown', (e) => { if (e.target === palette) closePalette(); });

  /* ================================================================== *
   * Tooltip & toast
   * ================================================================== */
  const tip = $('#tooltip');
  let tipTimer = 0;
  let tipFor = null;

  function hideTip() {
    clearTimeout(tipTimer);
    tipFor = null;
    tip.classList.remove('show');
  }

  function showTip(t) {
    if (!t.isConnected || !t.dataset.tip || t.getAttribute('aria-expanded') === 'true') return;
    tip.textContent = t.dataset.tip;
    const r = t.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let top = r.bottom + 6;
    let side = 'bottom';
    if (top + th > innerHeight - 8) { top = r.top - th - 6; side = 'top'; }
    const left = Math.min(innerWidth - tw - 8, Math.max(8, r.left + r.width / 2 - tw / 2));
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
    tip.dataset.side = side;
    tip.classList.add('show');
  }

  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const t = e.target.closest('[data-tip]');
    if (t === tipFor) return;
    hideTip();
    if (!t) return;
    tipFor = t;
    tipTimer = setTimeout(() => showTip(t), 500);
  });
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('scroll', hideTip, true);
  window.addEventListener('blur', hideTip);

  const toastEl = $('#toast');
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ================================================================== *
   * Misc actions
   * ================================================================== */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = el('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) { /* ignore */ }
      ta.remove();
    }
  }

  function share() {
    copyText(location.href);
    toast('Link copied');
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) { toast("Read aloud isn't supported in this browser"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, ' ').replace(/[#*`>]/g, ' ').replace(/\s+/g, ' '));
    u.lang = hasCJK(text) ? 'zh-CN' : 'en-US';
    speechSynthesis.speak(u);
  }

  function applyTheme(t) {
    state.theme = t;
    app.classList.add('no-trans');
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = t;
    store.set('orbit.theme', t);
    requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove('no-trans')));
  }

  /* ---------- Dictation (Web Speech API, where available) ---------- */
  let recog = null;
  function toggleDictation() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast("Dictation isn't supported in this browser"); return; }
    if (recog) { recog.stop(); return; }
    const r = new SR();
    recog = r;
    r.lang = navigator.language || 'en-US';
    r.interimResults = true;
    r.continuous = false;
    const base = input.value ? input.value.replace(/\s*$/, ' ') : '';
    r.onresult = (e) => {
      let t = '';
      for (const res of e.results) t += res[0].transcript;
      input.value = base + t;
      onInput();
    };
    r.onerror = (e) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') toast('Dictation error: ' + e.error);
    };
    r.onend = () => {
      if (recog === r) recog = null;
      micBtn.classList.remove('rec');
      micBtn.setAttribute('aria-pressed', 'false');
    };
    micBtn.classList.add('rec');
    micBtn.setAttribute('aria-pressed', 'true');
    try { r.start(); } catch (e) { r.onend(); }
  }
  function stopDictation() {
    if (recog) { try { recog.abort(); } catch (e) { /* ignore */ } }
  }

  /* ---------- Sidebar / panel ---------- */
  function toggleSidebar() {
    hideTip();
    if (mobileMQ.matches) { app.classList.toggle('sb-mobile-open'); return; }
    const collapsed = app.classList.toggle('sb-collapsed');
    store.set('orbit.sidebar', collapsed ? '0' : '1');
  }
  function closeMobileSidebar() { app.classList.remove('sb-mobile-open'); }

  /* ================================================================== *
   * Settings dialog
   * Open: opacity + scale(.96 → 1), 260ms cubic-bezier(.22, 1, .36, 1)
   * Close: 180ms cubic-bezier(.2, 0, 0, 1)
   * ================================================================== */
  const SETTINGS_DEFAULTS = {
    language: 'English',
    wrapCode: false,
    reduceMotion: false,
    showSuggestions: true,
    modEnter: false,
    autoScroll: true,
    voice: 'Nova',
    speed: 'Normal',
    personality: 'Assistant',
    dictation: 'Tidy up',
    browserNotify: false,
    productEmails: 'Off',
    responseStyle: 'Default',
    improveModel: true,
    personalizeHistory: true,
    linkSharing: true,
    watermark: false,
    connected: [],
    automations: [],
  };
  const settings = (() => {
    let saved = {};
    try { saved = JSON.parse(store.get('orbit.settings', '{}')) || {}; } catch (e) { saved = {}; }
    const s = Object.assign({}, SETTINGS_DEFAULTS, saved);
    if (!Array.isArray(s.connected)) s.connected = [];
    if (!Array.isArray(s.automations)) s.automations = [];
    return s;
  })();
  const saveSettings = () => store.set('orbit.settings', JSON.stringify(settings));

  const ST_TABS = [
    { id: 'account', label: 'Account', icon: 'user', keys: 'profile email sign out language plan dashboard birth' },
    { id: 'appearance', label: 'Appearance', icon: 'contrast', keys: 'theme dark light system code wrap motion animation suggestions' },
    { id: 'behavior', label: 'Behavior', icon: 'sliders', keys: 'enter submit send scroll voice speed personality dictation' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', keys: 'browser email updates alerts' },
    { id: 'customize', label: 'Customize', icon: 'sparkle', keys: 'response style agents' },
    { id: 'apps', label: 'Connect Apps', icon: 'plug', keys: 'integrations connectors calendar code notes payments design drive mail' },
    { id: 'skills', label: 'Skills', icon: 'library', keys: 'skill docx pdf pptx xlsx' },
    { id: 'automations', label: 'Automations', icon: 'clock', keys: 'schedule tasks briefing digest planner' },
    { id: 'bots', label: 'Bots', icon: 'bot', keys: 'vault logins cards contact' },
    { id: 'data', label: 'Data Controls', icon: 'shield', keys: 'privacy training memory history sharing watermark delete' },
    { id: 'billing', label: 'Billing', icon: 'card', keys: 'plan payment invoice upgrade subscription' },
    { id: 'usage', label: 'Usage', icon: 'bars', keys: 'limits messages images voice' },
  ];

  const APPS = [
    { id: 'calendar', name: 'Calendar', desc: 'See your schedule and plan around it', icon: 'calendar', cat: 'Productivity', color: '#2f80ed', rec: true },
    { id: 'repo', name: 'Code Host', desc: 'Browse repos, issues and pull requests', icon: 'code', cat: 'Developer', color: 'var(--fg)', rec: true },
    { id: 'ledger', name: 'Ledger', desc: 'Read balances and recent transactions', icon: 'card', cat: 'Finance', color: '#12a150', rec: true },
    { id: 'notebook', name: 'Notebook', desc: 'Search your pages, docs and wikis', icon: 'doc', cat: 'Productivity', color: '#7c5cff', rec: true },
    { id: 'payments', name: 'Payments', desc: 'Look up charges, customers and payouts', icon: 'bolt', cat: 'Finance', color: '#5b5bf0', rec: true },
    { id: 'canvas', name: 'Canvas', desc: 'Find designs and start new ones', icon: 'pencil', cat: 'Design', color: '#0aa5c2', rec: true },
    { id: 'mail', name: 'Mail', desc: 'Summarize threads and draft replies', icon: 'mail', cat: 'Productivity', color: '#e5484d' },
    { id: 'drive', name: 'Drive', desc: 'Pull in files from cloud storage', icon: 'folder', cat: 'Productivity', color: '#f5a524' },
    { id: 'metrics', name: 'Metrics', desc: 'Query dashboards and product analytics', icon: 'bars', cat: 'Analytics', color: '#0091ff' },
    { id: 'ads', name: 'Ad Manager', desc: 'Check campaign spend and results', icon: 'globe', cat: 'Advertising', color: 'var(--fg)' },
  ];
  const APP_CATS = ['All', 'Advertising', 'Analytics', 'Design', 'Developer', 'Finance', 'Productivity'];

  const AUTOS = [
    { id: 'custom', name: 'Custom', desc: 'Start from a blank automation', icon: 'plus', color: '', cat: 'Featured' },
    { id: 'brief', name: 'Morning briefing', desc: 'Headlines, weather and your day at a glance', icon: 'sun', color: '#1184fe', cat: 'News' },
    { id: 'markets', name: 'Market watch', desc: 'Price moves and news for your watchlist', icon: 'bars', color: '#f76b15', cat: 'Finance' },
    { id: 'tech', name: 'Tech digest', desc: 'Notable launches and research, summarized', icon: 'sparkle', color: '#1184fe', cat: 'News' },
    { id: 'planner', name: 'Daily planner', desc: 'A realistic plan built from your calendar', icon: 'calendar', color: '#e93d82', cat: 'Productivity' },
    { id: 'review', name: 'Weekly review', desc: 'What got done and what comes next', icon: 'doc', color: '#e93d82', cat: 'Productivity' },
    { id: 'inbox', name: 'Inbox triage', desc: 'Short draft replies for important email', icon: 'mail', color: '#e93d82', cat: 'Productivity' },
    { id: 'papers', name: 'Paper tracker', desc: 'New papers on topics you follow', icon: 'library', color: '#7c5cff', cat: 'Research' },
    { id: 'meals', name: 'Meal ideas', desc: 'Weeknight dinners from what you have', icon: 'chef', color: '#12a150', cat: 'Lifestyle' },
  ];
  const AUTO_TABS = ['All', 'News', 'Productivity', 'Finance', 'Research', 'Lifestyle'];

  const stLayer = $('#settings');
  const stTabsEl = $('#stTabs');
  const stHead = $('#stHead');
  const stBody = $('#stBody');
  const stMain = $('#stMain');
  const stSearch = $('#stSearch');
  let stTab = 'account';
  let stPrevFocus = null;
  let stCloseTimer = 0;
  let stConfirmTimer = 0;
  let appCat = 'All';
  let appQuery = '';
  let autoCat = 'All';
  let autoQuery = '';

  const THEME_LABEL = { light: 'Light', dark: 'Dark', system: 'System' };
  const getSetting = (k) => (k === 'theme' ? THEME_LABEL[state.theme] || 'System' : settings[k]);

  /* ---------- Small HTML builders ---------- */
  const stSection = (title, inner, note) => `<section class="st-section">${title ? `<h3 class="st-section-title">${esc(title)}</h3>` : ''}${inner}${note ? `<p class="st-note">${esc(note)}</p>` : ''}</section>`;
  const stCard = (rows) => `<div class="st-card">${rows.join('')}</div>`;
  const stRow = (label, control = '', desc = '') => `<div class="st-row"><div class="st-row-text"><span class="st-label">${esc(label)}</span>${desc ? `<span class="st-desc">${esc(desc)}</span>` : ''}</div>${control}</div>`;
  const stToggle = (key, label) => `<button type="button" class="switch" role="switch" aria-checked="${!!settings[key]}" aria-label="${esc(label)}" data-toggle="${key}"></button>`;
  const stSelect = (key, options) => `<button type="button" class="st-btn st-select" aria-haspopup="menu" aria-expanded="false" data-select="${key}" data-options="${esc(options.join('|'))}"><span class="sel-label">${esc(getSetting(key))}</span>${icon('chevronDown')}</button>`;
  const stButton = (label, act, opts = {}) => `<button type="button" class="st-btn${opts.cls ? ' ' + opts.cls : ''}" data-act="${esc(act)}">${opts.lead ? icon(opts.lead) : ''}<span>${esc(label)}</span>${opts.trail ? icon(opts.trail) : ''}</button>`;
  const stValue = (text) => `<span class="st-value">${esc(text)}</span>`;
  const stEmpty = (ic, text, action = '') => `<div class="st-card st-empty">${icon(ic)}<p>${esc(text)}</p>${action}</div>`;
  const demo = (what) => `toast:${what} isn't available in this demo`;

  function appTile(a) {
    const on = settings.connected.includes(a.id);
    const btn = on
      ? stButton('Connected', 'connect:' + a.id, { cls: 'soft is-on', lead: 'check' })
      : stButton('Connect', 'connect:' + a.id, { cls: 'soft' });
    return `<div class="tile"><span class="tile-ico" style="color:${a.color}">${icon(a.icon)}</span><div class="tile-text"><div class="tile-name">${esc(a.name)}</div><div class="tile-desc">${esc(a.desc)}</div></div>${btn}</div>`;
  }

  function autoTile(a) {
    const on = settings.automations.includes(a.id);
    const ico = a.color
      ? `<span class="tile-ico solid" style="background:${a.color}">${icon(a.icon)}</span>`
      : `<span class="tile-ico">${icon(a.icon)}</span>`;
    const btn = a.id === 'custom'
      ? stButton('Add', demo('Building custom automations'))
      : stButton(on ? 'Added' : 'Add', 'auto:' + a.id, { cls: on ? 'is-on' : '', lead: on ? 'check' : '' });
    return `<div class="tile">${ico}<div class="tile-text"><div class="tile-name">${esc(a.name)}</div><div class="tile-desc">${esc(a.desc)}</div></div>${btn}</div>`;
  }

  /* ---------- Tab renderers ---------- */
  const ST_RENDER = {
    account: () => ({
      body: [
        stSection('Account', stCard([
          `<div class="st-row st-profile"><span class="avatar lg" aria-hidden="true">G</span><div class="st-row-text"><span class="st-label">Guest</span><span class="st-desc">guest@example.com</span></div><div class="st-actions">${stButton('Manage Account', demo('Account management'), { trail: 'arrowUpRight' })}${stButton('Sign Out', 'signout')}</div></div>`,
          stRow('Orbit dashboard', stButton('Open', demo('The dashboard'), { trail: 'arrowUpRight' }), 'API keys, usage and team settings'),
          stRow('Linked account', stValue('Not linked')),
          stRow('Birth year', stValue('Not set')),
        ])),
        stSection('App', stCard([stRow('Language', stSelect('language', ['English', '简体中文', '日本語', 'Español']))])),
        stSection('Plan', stCard([stRow('Free', stButton('Manage', 'tab:billing'))])),
      ].join(''),
    }),

    appearance: () => ({
      body: stSection('Appearance', stCard([
        stRow('Theme', stSelect('theme', ['Light', 'Dark', 'System'])),
        stRow('Wrap long code blocks', stToggle('wrapCode', 'Wrap long code blocks'), 'Soft-wrap long lines instead of scrolling sideways'),
        stRow('Reduce motion', stToggle('reduceMotion', 'Reduce motion')),
        stRow('Show suggestions', stToggle('showSuggestions', 'Show suggestions'), 'Prompt ideas on the home screen and follow-up chips after replies'),
      ])),
    }),

    behavior: () => ({
      body: [
        stSection('Sending', stCard([
          stRow(`Require ${MOD}${isMac ? '' : '+'}Enter to send`, stToggle('modEnter', `Require ${MOD} Enter to send`), 'Plain Enter adds a new line instead'),
          stRow('Auto-scroll', stToggle('autoScroll', 'Auto-scroll'), 'Keep the newest text in view while a reply streams in'),
        ])),
        stSection('Voice', stCard([
          stRow('Voice', stSelect('voice', ['Nova', 'Ember', 'Sol', 'Atlas'])),
          stRow('Speed', stSelect('speed', ['Slow', 'Normal', 'Fast'])),
          stRow('Personality', stSelect('personality', ['Assistant', 'Friend', 'Coach', 'Storyteller'])),
          stRow('Dictation cleanup', stSelect('dictation', ['Off', 'Tidy up', 'Rewrite']), 'How much dictated text is cleaned up before it is sent'),
        ]), 'Voice changes take effect from the next reply.'),
      ].join(''),
    }),

    notifications: () => ({
      body: [
        stSection('', stCard([stRow('Browser notifications', stToggle('browserNotify', 'Browser notifications'), 'Get a ping when a reply finishes while this tab is in the background')])),
        stSection('Email', stCard([stRow('Product updates', stSelect('productEmails', ['Off', 'Monthly', 'Weekly']), 'New features and the occasional tip')])),
      ].join(''),
    }),

    customize: () => {
      const slots = Array.from({ length: 15 }, (_, i) => `<button type="button" class="agent-slot" data-act="${esc(demo('Adding agents'))}"><span class="agent-ico">${icon('plus')}</span><span>Agent ${i + 1}</span></button>`).join('');
      return {
        body: [
          stSection('', stCard([stRow('Response style', stSelect('responseStyle', ['Default', 'Concise', 'Detailed', 'Playful']), 'Shape how Orbit writes its replies')])),
          stSection('Active agents', `<div class="agent-grid"><div class="agent-slot filled"><span class="agent-ico av">${icon('orbit')}</span><span>Orbit</span></div>${slots}</div>`, 'Agents in these slots join your chats.'),
          stSection('Available agents', `<button type="button" class="agent-create" data-act="${esc(demo('Creating agents'))}"><span class="agent-ico sq">${icon('plus')}</span><span>Create</span></button>`, 'Agents you build appear here. Drag one into a slot above to use it.'),
        ].join(''),
      };
    },

    apps: () => ({
      head: `<span class="st-head-meta" id="stAppsCount">${settings.connected.length} connected</span>`,
      body: `<label class="st-search wide">${icon('search')}<input type="text" placeholder="Search apps" aria-label="Search apps" data-search="apps" value="${esc(appQuery)}"></label>
        <div class="st-chips" role="tablist">${APP_CATS.map((c) => `<button type="button" class="st-chip${c === appCat ? ' active' : ''}" data-chip="${c}" role="tab" aria-selected="${c === appCat}">${c}</button>`).join('')}</div>
        <div id="stAppsList">${appsListHtml()}</div>`,
    }),

    skills: () => {
      const builtins = [
        ['doc', 'docx', 'Create and edit Word documents'],
        ['doc', 'pdf', 'Read, merge, split and fill in PDFs'],
        ['monitor', 'pptx', 'Build and edit slide decks'],
        ['table', 'xlsx', 'Work with spreadsheets and CSV files'],
      ];
      return {
        body: [
          stSection('Personal', stEmpty('library', 'Teach Orbit a repeatable task it can reuse whenever a request matches.', stButton('New skill', demo('Custom skills')))),
          stSection('Built-in', stCard(builtins.map(([ic, name, desc]) => `<div class="st-row st-row-icon">${icon(ic)}<div class="st-row-text"><span class="st-label">${name}</span><span class="st-desc">${desc}</span></div></div>`))),
        ].join(''),
      };
    },

    automations: () => ({
      head: `<label class="st-search sm">${icon('search')}<input type="text" placeholder="Search automations" aria-label="Search automations" data-search="autos" value="${esc(autoQuery)}"></label>`,
      body: `<div class="st-seg" role="tablist">${AUTO_TABS.map((c) => `<button type="button" class="st-seg-btn${c === autoCat ? ' active' : ''}" data-seg="${c}" role="tab" aria-selected="${c === autoCat}">${c}</button>`).join('')}</div>
        <div id="stAutosList">${autosListHtml()}</div>`,
    }),

    bots: () => ({
      body: `<div class="vault-head"><span class="st-label">Vault</span><button type="button" class="st-btn primary" data-act="${esc(demo('Saving vault items'))}"><span>New item</span>${icon('chevronDown')}</button></div>
        <div class="vault-bar"><div class="st-seg">${['All', 'Logins', 'Cards', 'Contact info'].map((t, i) => `<button type="button" class="st-seg-btn${i === 0 ? ' active' : ''}" data-vault="${t}">${t} <span class="count">0</span></button>`).join('')}</div><label class="st-search sm">${icon('search')}<input type="text" placeholder="Search vault" aria-label="Search vault"></label></div>
        ${stEmpty('bot', 'Your vault is empty. Logins, cards and contact details that bots are allowed to use will show up here.')}`,
    }),

    data: () => ({
      body: [
        stSection('Personalization', stCard([
          stRow('Help improve the model', stToggle('improveModel', 'Help improve the model'), 'Allow your chats to be used to make future models better. You can change this at any time.'),
          stRow('Personalize with chat history', stToggle('personalizeHistory', 'Personalize with chat history'), 'Let Orbit remember useful details from past conversations. Private chats are never used.'),
          stRow('Memory', stButton('View', 'toast:Nothing has been remembered yet'), 'See what Orbit has picked up from your chats'),
          stRow('Import memory', stButton('Start import', demo('Importing memory')), 'Bring context over from another assistant'),
        ]), 'These settings apply on every device you use.'),
        stSection('Sharing', stCard([stRow('Allow link sharing', stToggle('linkSharing', 'Allow link sharing'), 'Anyone with a chat link can view that chat')])),
        stSection('Imagine', stCard([stRow('Watermark generations', stToggle('watermark', 'Watermark generations'), 'Add a subtle mark to images and videos you create')])),
        stSection('Danger zone', stCard([stRow('Delete all chats', stButton('Delete all', 'deleteAll', { cls: 'danger' }), 'Clear every chat from the sidebar')])),
      ].join(''),
    }),

    billing: () => ({
      body: [
        stSection('Plan', stCard([stRow('Free', stButton('Upgrade', demo('Upgrading'), { cls: 'primary' }), 'Everyday use with daily limits')])),
        stSection('Payment method', stCard([stRow('No payment method', stButton('Add', demo('Adding a payment method')))])),
        stSection('Invoices', stEmpty('card', 'No invoices yet.')),
      ].join(''),
    }),

    usage: () => {
      const countUser = (c) => c.messages.filter((m) => m.role === 'user').length;
      let msgs = state.chats.reduce((n, c) => n + countUser(c), 0);
      if (state.conv && state.conv.private) msgs += countUser(state.conv);
      const rows = [['Messages', msgs, 50], ['Images', 0, 20], ['Voice minutes', 0, 30]];
      return {
        body: stSection('Today', stCard(rows.map(([label, used, max]) => `<div class="st-row"><div class="st-row-text"><div class="meter-top"><span class="st-label">${label}</span><span class="st-value">${used} / ${max}</span></div><div class="meter"><span data-v="${Math.min(100, (used / max) * 100).toFixed(1)}"></span></div></div></div>`)), 'Limits reset at midnight, local time.'),
        mount(root) {
          const bars = $$('.meter > span', root);
          requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach((b) => { b.style.width = b.dataset.v + '%'; })));
        },
      };
    },
  };

  function appsListHtml() {
    const q = appQuery.trim().toLowerCase();
    const match = (a) => (appCat === 'All' || a.cat === appCat) && (!q || (a.name + ' ' + a.desc).toLowerCase().includes(q));
    const list = APPS.filter(match);
    if (!list.length) return stEmpty('plug', 'No apps match your search.');
    const grid = (items) => `<div class="tile-grid">${items.map(appTile).join('')}</div>`;
    if (appCat !== 'All' || q) return stSection(q ? 'Results' : appCat, grid(list));
    const groups = APP_CATS.slice(1).map((c) => [c, list.filter((a) => a.cat === c)]).filter(([, items]) => items.length);
    return stSection('Recommended for you', grid(list.filter((a) => a.rec)))
      + groups.map(([c, items]) => stSection(c, grid(items))).join('');
  }

  function autosListHtml() {
    const q = autoQuery.trim().toLowerCase();
    const mine = AUTOS.filter((a) => settings.automations.includes(a.id));
    const yours = mine.length
      ? stCard(mine.map((a) => `<div class="st-row st-row-icon">${icon(a.icon)}<div class="st-row-text"><span class="st-label">${esc(a.name)}</span><span class="st-desc">Runs every morning at 8:00</span></div>${stButton('Remove', 'auto:' + a.id)}</div>`))
      : stCard(['<div class="st-row"><span class="st-desc">No automations yet. Add one below to get started.</span></div>']);
    const grid = (items) => `<div class="tile-grid">${items.map(autoTile).join('')}</div>`;
    const match = (a) => (!q || (a.name + ' ' + a.desc).toLowerCase().includes(q));
    let rest;
    if (q) {
      const found = AUTOS.filter(match);
      rest = found.length ? stSection('Results', grid(found)) : stEmpty('clock', 'No automations match your search.');
    } else if (autoCat === 'All') {
      rest = stSection('Featured', grid(AUTOS.slice(0, 6)))
        + AUTO_TABS.slice(1).map((c) => [c, AUTOS.filter((a) => a.cat === c)]).filter(([, items]) => items.length).map(([c, items]) => stSection(c, grid(items))).join('');
    } else {
      const items = AUTOS.filter((a) => a.cat === autoCat);
      rest = items.length ? stSection(autoCat, grid(items)) : stEmpty('clock', 'Nothing here yet.');
    }
    return stSection('Your automations', yours) + rest;
  }

  /* ---------- Rendering & navigation ---------- */
  function renderStTabs() {
    const q = stSearch.value.trim().toLowerCase();
    const tabs = ST_TABS.filter((t) => !q || t.label.toLowerCase().includes(q) || t.keys.includes(q));
    stTabsEl.replaceChildren(...tabs.map((t) => {
      const b = el('button', 'st-tab' + (t.id === stTab ? ' active' : ''));
      b.type = 'button';
      b.dataset.tab = t.id;
      if (t.id === stTab) b.setAttribute('aria-current', 'page');
      b.innerHTML = `${icon(t.icon)}<span>${esc(t.label)}</span>`;
      return b;
    }));
    if (!tabs.length) stTabsEl.append(el('p', 'st-nores', 'No matching settings'));
  }

  function renderStBody() {
    const tab = ST_TABS.find((t) => t.id === stTab) || ST_TABS[0];
    const view = ST_RENDER[tab.id]();
    stHead.innerHTML = `<h1 class="st-title" id="stTitle">${esc(tab.label)}</h1>${view.head || ''}`;
    stBody.innerHTML = view.body;
    stMain.scrollTop = 0;
    if (view.mount) view.mount(stBody);
  }

  function setSettingsTab(id) {
    stTab = ST_RENDER[id] ? id : 'account';
    closeMenu(true);
    renderStTabs();
    renderStBody();
    syncSettingsUrl(false);
  }

  function syncSettingsUrl(clear) {
    try {
      const u = new URL(location.href);
      if (clear) u.searchParams.delete('_s');
      else u.searchParams.set('_s', stTab);
      history.replaceState(history.state, '', u);
    } catch (e) { /* not available (e.g. some file:// contexts) */ }
  }

  function openSettings(tab = 'account') {
    clearTimeout(stCloseTimer);
    closeMenu(true);
    hideTip();
    if (!palette.hidden) { palette.classList.remove('open'); palette.hidden = true; }
    if (mobileMQ.matches) closeMobileSidebar();
    if (stLayer.hidden || !stLayer.classList.contains('open')) stPrevFocus = document.activeElement;
    stSearch.value = '';
    setSettingsTab(tab);
    stLayer.hidden = false;
    void stLayer.offsetWidth;
    stLayer.classList.add('open');
    const active = stTabsEl.querySelector('.st-tab.active');
    if (active) active.focus({ preventScroll: true });
  }

  function closeSettings() {
    if (stLayer.hidden || !stLayer.classList.contains('open')) return;
    closeMenu(true);
    stLayer.classList.remove('open');
    stCloseTimer = setTimeout(() => { stLayer.hidden = true; }, 200);
    syncSettingsUrl(true);
    if (stPrevFocus && stPrevFocus.isConnected && stPrevFocus.focus) stPrevFocus.focus({ preventScroll: true });
  }

  /* ---------- Applying settings ---------- */
  function applySettings() {
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
    app.classList.toggle('wrap-code', !!settings.wrapCode);
    app.classList.toggle('no-suggestions', !settings.showSuggestions);
  }

  function setSetting(key, value) {
    if (key === 'theme') { applyTheme(String(value).toLowerCase()); return; }
    settings[key] = value;
    saveSettings();
    applySettings();
    if (key === 'browserNotify' && value) requestNotify();
  }

  function revertNotify() {
    settings.browserNotify = false;
    saveSettings();
    const sw = stBody.querySelector('[data-toggle="browserNotify"]');
    if (sw) sw.setAttribute('aria-checked', 'false');
  }

  function requestNotify() {
    if (!('Notification' in window)) { toast("Notifications aren't supported in this browser"); revertNotify(); return; }
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') { toast('Notifications are blocked for this site'); revertNotify(); return; }
    Notification.requestPermission()
      .then((p) => { if (p !== 'granted') revertNotify(); })
      .catch(revertNotify);
  }

  function notifyDone(text) {
    if (!settings.browserNotify || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification('Orbit', { body: text.replace(/```[\s\S]*?```/g, ' ').replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120), icon: 'favicon.svg' });
    } catch (e) { /* ignore */ }
  }

  function toggleListItem(list, id) {
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else list.push(id);
    saveSettings();
  }

  function confirmDeleteAll(btn) {
    const label = btn.querySelector('span');
    if (!btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      label.textContent = 'Click again to confirm';
      clearTimeout(stConfirmTimer);
      stConfirmTimer = setTimeout(() => {
        if (!btn.isConnected) return;
        btn.classList.remove('confirm');
        label.textContent = 'Delete all';
      }, 3000);
      return;
    }
    clearTimeout(stConfirmTimer);
    const inSavedChat = state.mode === 'chat' && state.conv && !state.conv.private;
    state.chats = [];
    state.activeId = null;
    if (inSavedChat) goHome();
    renderChats();
    btn.classList.remove('confirm');
    label.textContent = 'Delete all';
    toast('All chats deleted');
  }

  function runSettingsAction(act, btn) {
    const i = act.indexOf(':');
    const kind = i < 0 ? act : act.slice(0, i);
    const arg = i < 0 ? '' : act.slice(i + 1);
    if (kind === 'toast') toast(arg);
    else if (kind === 'tab') setSettingsTab(arg);
    else if (kind === 'signout') toast("You're browsing as a guest");
    else if (kind === 'deleteAll') confirmDeleteAll(btn);
    else if (kind === 'connect') {
      toggleListItem(settings.connected, arg);
      $('#stAppsList').innerHTML = appsListHtml();
      $('#stAppsCount').textContent = `${settings.connected.length} connected`;
    } else if (kind === 'auto') {
      toggleListItem(settings.automations, arg);
      $('#stAutosList').innerHTML = autosListHtml();
    }
  }

  stTabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.st-tab');
    if (b) setSettingsTab(b.dataset.tab);
  });
  stTabsEl.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const tabs = $$('.st-tab', stTabsEl);
    const idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    e.preventDefault();
    const next = tabs[(idx + (e.key === 'ArrowDown' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    setSettingsTab(next.dataset.tab);
    const again = stTabsEl.querySelector('.st-tab.active');
    if (again) again.focus();
  });
  stSearch.addEventListener('input', renderStTabs);
  stSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      const first = stTabsEl.querySelector('.st-tab');
      if (first) first.click();
    }
  });
  stLayer.addEventListener('mousedown', (e) => { if (e.target === stLayer) closeSettings(); });
  $('#stClose').addEventListener('click', closeSettings);

  stMain.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle],[data-select],[data-act],[data-chip],[data-seg],[data-vault]');
    if (!t) return;
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      setSetting(k, !settings[k]);
      t.setAttribute('aria-checked', String(!!settings[k]));
    } else if (t.dataset.select) {
      const k = t.dataset.select;
      const opts = t.dataset.options.split('|');
      toggleMenu(t, () => opts.map((o) => ({
        label: o,
        checked: getSetting(k) === o,
        action: () => { setSetting(k, o); t.querySelector('.sel-label').textContent = o; },
      })), { align: 'right', keyboard: e.detail === 0 });
    } else if (t.dataset.act) {
      runSettingsAction(t.dataset.act, t);
    } else if (t.dataset.chip) {
      appCat = t.dataset.chip;
      $$('.st-chip', stBody).forEach((c) => {
        c.classList.toggle('active', c === t);
        c.setAttribute('aria-selected', String(c === t));
      });
      $('#stAppsList').innerHTML = appsListHtml();
    } else if (t.dataset.seg) {
      autoCat = t.dataset.seg;
      $$('[data-seg]', stBody).forEach((c) => {
        c.classList.toggle('active', c === t);
        c.setAttribute('aria-selected', String(c === t));
      });
      $('#stAutosList').innerHTML = autosListHtml();
    } else if (t.dataset.vault) {
      $$('[data-vault]', stBody).forEach((c) => c.classList.toggle('active', c === t));
    }
  });
  stMain.addEventListener('input', (e) => {
    const kind = e.target.dataset && e.target.dataset.search;
    if (kind === 'apps') {
      appQuery = e.target.value;
      $('#stAppsList').innerHTML = appsListHtml();
    } else if (kind === 'autos') {
      autoQuery = e.target.value;
      $('#stAutosList').innerHTML = autosListHtml();
    }
  });

  /* ================================================================== *
   * Event wiring
   * ================================================================== */
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    const withMod = e.metaKey || e.ctrlKey;
    // Default: Enter sends, Shift+Enter adds a line. With "Require ⌘Enter", plain Enter adds a line.
    if (settings.modEnter ? withMod : !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });
  composer.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  composer.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target === input) return;
    e.preventDefault();
    input.focus();
  });

  actionBtn.addEventListener('click', () => {
    const k = actionBtn.dataset.kind;
    if (k === 'send') send(input.value);
    else if (k === 'stop') stopStream();
    else if (k === 'voice') toast("Voice mode isn't available in this demo");
  });
  micBtn.addEventListener('click', toggleDictation);

  modelBtn.addEventListener('click', (e) => {
    toggleMenu(modelBtn, () => MODELS.map((m) => ({ label: m, checked: m === state.model, action: () => setModel(m) })), { align: 'right', keyboard: e.detail === 0 });
  });

  plusBtn.addEventListener('click', (e) => {
    toggleMenu(plusBtn, () => [
      { icon: 'paperclip', label: 'Upload a file', action: () => { fileInput.accept = ''; fileInput.click(); } },
      { icon: 'image', label: 'Add photos', action: () => { fileInput.accept = 'image/*'; fileInput.click(); } },
      'sep',
      { icon: 'plug', label: 'Connectors', action: () => toast("Connectors aren't available in this demo") },
      { icon: 'wand', label: 'Skills', action: () => toast("Skills aren't available in this demo") },
    ], { align: 'left', keyboard: e.detail === 0 });
  });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    if (f) toast(`Attached ${f.name} (demo only — nothing is uploaded)`);
    fileInput.value = '';
  });

  const showHelpMenu = () => showMenu(accountBtn, [
    { icon: 'help', label: 'Help center', action: () => toast("The help center isn't available in this demo") },
    { icon: 'sliders', label: 'Keyboard shortcuts', action: () => toast(`${MOD} K search · ${MOD} J new chat · ${MOD} , settings`) },
    { icon: 'sparkle', label: 'Release notes', action: () => toast("Release notes aren't available in this demo") },
    { icon: 'doc', label: 'Terms & policies', action: () => toast("Policies aren't available in this demo") },
  ], { align: 'left' });

  accountBtn.addEventListener('click', (e) => {
    toggleMenu(accountBtn, () => [
      { profile: true, name: 'Guest', email: 'guest@example.com' },
      { icon: 'grid', label: 'Dashboard', trail: 'arrowUpRight', action: () => toast("The dashboard isn't available in this demo") },
      { icon: 'gear', label: 'Settings', action: () => openSettings('account') },
      { icon: 'userPlus', label: 'Invite teammates', action: () => toast("Invites aren't available in this demo") },
      { icon: 'help', label: 'Help', trail: 'chevronRight', action: showHelpMenu },
      'sep',
      { icon: 'logout', label: 'Sign out', action: () => toast("You're browsing as a guest") },
    ], { align: 'left', keyboard: e.detail === 0 });
  });

  privateBtn.addEventListener('click', () => setPrivate(!state.private));
  $('#botPill').addEventListener('click', () => toast('The Orbit Bot app is coming soon'));
  $('#newChatBtn').addEventListener('click', () => goHome());
  $('#sidebarToggle').addEventListener('click', toggleSidebar);
  $('#searchBtn').addEventListener('click', openPalette);
  $('#appsBtn').addEventListener('click', () => openSettings('apps'));
  $('#groupBotsBtn').addEventListener('click', () => toast("Grouping isn't available in this demo"));
  $('#newBotBtn').addEventListener('click', () => toast("Creating bots isn't available in this demo"));
  $('#scrim').addEventListener('click', closeMobileSidebar);
  $('#panelToggle').addEventListener('click', () => app.classList.toggle('panel-open'));
  $('#panelClose').addEventListener('click', () => app.classList.remove('panel-open'));
  $$('.sb-nav .sb-item').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.nav === 'imagine') goHome({ variant: 'imagine' });
    else showLibrary();
  }));
  $$('.lib-tab').forEach((t) => t.addEventListener('click', () => {
    $$('.lib-tab').forEach((x) => {
      x.classList.toggle('active', x === t);
      x.setAttribute('aria-selected', String(x === t));
    });
  }));

  document.addEventListener('keydown', (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    const k = (e.key || '').toLowerCase();
    const settingsOpen = !stLayer.hidden && stLayer.classList.contains('open');
    if (mod && !e.altKey && !e.shiftKey && k === 'j') {
      e.preventDefault();
      if (!palette.hidden) closePalette();
      if (settingsOpen) closeSettings();
      goHome();
      return;
    }
    if (mod && !e.altKey && k === 'k') {
      e.preventDefault();
      if (settingsOpen) closeSettings();
      if (palette.hidden || !palette.classList.contains('open')) openPalette();
      else closePalette();
      return;
    }
    if (mod && !e.altKey && !e.shiftKey && e.key === ',') {
      e.preventDefault();
      if (settingsOpen) closeSettings();
      else openSettings();
      return;
    }
    if (!palette.hidden) return;
    if (openMenu) { menuKeys(e); return; }
    if (settingsOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeSettings(); }
      return;
    }
    if (e.key === 'Escape') {
      if (app.classList.contains('sb-mobile-open')) closeMobileSidebar();
      else if (state.stream) stopStream();
      return;
    }
    if (e.key === '/' && !mod && !isTyping(e.target)) {
      e.preventDefault();
      input.focus();
    }
  });

  mobileMQ.addEventListener('change', () => {
    closeMobileSidebar();
    closeMenu(true);
  });

  /* ================================================================== *
   * Init
   * ================================================================== */
  function init() {
    hydrateIcons();
    $('#newChatKbd').textContent = `${MOD} J`;
    $('#searchBtn').dataset.tip = `Search  ${MOD} K`;
    app.classList.add('no-trans');
    if (store.get('orbit.sidebar', '1') === '0') app.classList.add('sb-collapsed');
    setModel(state.model);
    morph = new TextMorph(greetingEl);
    morph.set(state.greeting, false);
    pickSuggestions();
    renderBelow();
    renderBots();
    renderProjects();
    renderChats();
    applySettings();
    updateAction();
    void app.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => app.classList.remove('no-trans')));
    replayEnter();
    if (!mobileMQ.matches) input.focus({ preventScroll: true });
    // Deep link: ?_s=appearance opens Settings on that tab.
    const deepTab = new URLSearchParams(location.search).get('_s');
    if (deepTab && ST_RENDER[deepTab]) openSettings(deepTab);
  }

  init();
})();
