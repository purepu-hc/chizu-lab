// イラストアイコン（すべてオリジナルのSVG。viewBox 0 0 32 32）
// 地図上では <use href="#ic-xxx">、パネルでは icon('xxx') で使う。
const O = '#3b2a1a'; // 輪郭線の色（こげ茶）
const s = (w = 1.4) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const ICONS = {
  // ───────── 農産物 ─────────
  rice: `<path d="M16 29V9" ${s()} fill="none"/><g fill="#f2c94c" ${s(1)}>
    <ellipse cx="12" cy="10" rx="2.2" ry="3.4" transform="rotate(-30 12 10)"/><ellipse cx="20" cy="10" rx="2.2" ry="3.4" transform="rotate(30 20 10)"/>
    <ellipse cx="11" cy="16" rx="2.2" ry="3.4" transform="rotate(-35 11 16)"/><ellipse cx="21" cy="16" rx="2.2" ry="3.4" transform="rotate(35 21 16)"/>
    <ellipse cx="16" cy="5.5" rx="2.2" ry="3.4"/><ellipse cx="11.5" cy="22" rx="2" ry="3" transform="rotate(-40 11.5 22)"/></g>
    <path d="M16 29c-3-2-6-2-9 0" ${s()} fill="none" stroke="#5a9e3a"/>`,
  wheat: `<path d="M16 30V6" ${s()} fill="none"/><g fill="#e0a83c" ${s(1)}>
    <path d="M16 6l-3 3 3 3 3-3z"/><path d="M16 11l-3.5 3 3.5 3 3.5-3z"/><path d="M16 16l-3.5 3 3.5 3 3.5-3z"/></g>
    <path d="M16 6l0-4M13 8l-2-3M19 8l2-3" ${s(1)} fill="none"/>`,
  soy: `<path d="M8 24c-2-6 2-14 9-17 6-2 9 2 7 7-2 6-9 12-16 10z" fill="#9ccc65" ${s()}/>
    <circle cx="12" cy="18" r="3" fill="#f3e5ab" ${s(1)}/><circle cx="16.5" cy="13.5" r="3" fill="#f3e5ab" ${s(1)}/><circle cx="20.5" cy="9.5" r="2.6" fill="#f3e5ab" ${s(1)}/>`,
  potato: `<path d="M6 17c0-6 5-10 11-10s10 4 9 10-6 9-11 9-9-3-9-9z" fill="#c9a26b" ${s()}/>
    <g fill="${O}"><circle cx="12" cy="14" r=".9"/><circle cx="19" cy="12" r=".9"/><circle cx="21" cy="19" r=".9"/><circle cx="14" cy="21" r=".9"/></g>`,
  onion: `<path d="M16 7c-6 4-10 8-10 13a10 7 0 0 0 20 0c0-5-4-9-10-13z" fill="#d9a35b" ${s()}/>
    <path d="M16 7V3M14 4l2 3 2-3" ${s(1.2)} fill="none"/><path d="M12 15c-1 4 0 8 2 11M20 15c1 4 0 8-2 11" ${s(1)} fill="none" opacity=".6"/>`,
  cabbage: `<circle cx="16" cy="17" r="11" fill="#9ccc65" ${s()}/><path d="M16 6c-5 4-5 18 0 22M16 6c5 4 5 18 0 22" ${s(1)} fill="none"/>
    <path d="M7 12c4 2 6 6 6 13M25 12c-4 2-6 6-6 13" ${s(1)} fill="none"/>`,
  lettuce: `<path d="M5 18c0-6 3-11 11-11s11 5 11 11c0 7-5 10-11 10S5 25 5 18z" fill="#b5e07a" ${s()}/>
    <path d="M5 18c3-1 4 2 6 1s2-4 5-4 3 3 5 4 4-2 6-1" ${s(1)} fill="none"/><path d="M16 15v12" ${s(1)}/>`,
  hakusai: `<path d="M11 29c-4-6-4-17 1-24 2-2 6-2 8 0 5 7 5 18 1 24z" fill="#f4f8e8" ${s()}/>
    <path d="M10 13c0-6 3-9 6-9s6 3 6 9c-2-2-4-2-6 0-2-2-4-2-6 0z" fill="#8bc34a" ${s(1)}/><path d="M16 13v15" ${s(1)}/>`,
  daikon: `<path d="M12 11h8c1 8-1 15-4 19-3-4-5-11-4-19z" fill="#fbfbf6" ${s()}/>
    <path d="M16 11c-3-4-6-6-8-6M16 11c0-4 0-7 0-9M16 11c3-4 6-6 8-6" ${s(1.6)} stroke="#5a9e3a" fill="none"/>`,
  carrot: `<path d="M11 11l10 0c0 7-3 14-5 19-2-5-5-12-5-19z" fill="#f2994a" ${s()}/>
    <path d="M16 11c-2-4-5-6-7-6M16 11V3M16 11c2-4 5-6 7-6" ${s(1.6)} stroke="#5a9e3a" fill="none"/><path d="M13 16h3M14 21h3" ${s(1)}/>`,
  tomato: `<circle cx="16" cy="18" r="10" fill="#eb5757" ${s()}/><path d="M11 9l5 3 5-3-3 0 1-3-3 2-3-2 1 3z" fill="#5a9e3a" ${s(1)}/>
    <ellipse cx="12" cy="15" rx="2" ry="1.2" fill="#fff" opacity=".6"/>`,
  cucumber: `<path d="M6 25C9 16 17 8 25 6c2 1 2 3 1 4-3 7-10 15-17 18-2 0-3-1-3-3z" fill="#6aa84f" ${s()}/>
    <g fill="#d6ecc5"><circle cx="13" cy="19" r=".8"/><circle cx="17" cy="14" r=".8"/><circle cx="21" cy="11" r=".8"/></g>`,
  pepper: `<path d="M9 13c0-3 3-4 7-4s7 1 7 4c0 7-1 15-7 15S9 20 9 13z" fill="#43a047" ${s()}/>
    <path d="M16 9V5c0-1 1-2 3-2" ${s(1.4)} fill="none"/><path d="M16 12v14" ${s(1)} opacity=".5"/>`,
  eggplant: `<path d="M21 9c4 3 5 9 1 15s-11 6-14 3 0-8 4-12c3-3 5-7 9-6z" fill="#6a3d9a" ${s()}/>
    <path d="M18 8c2-2 5-3 7-2-1 1 0 3-2 4-2 1-4 0-5-2z" fill="#5a9e3a" ${s(1)}/><path d="M24 6l3-3" ${s(1.4)}/>`,
  negi: `<path d="M13 30V14h6v16z" fill="#fbfbf6" ${s()}/><path d="M13 14L9 3M16 14V2M19 14l4-11" ${s(2)} stroke="#43a047" fill="none"/>`,
  strawberry: `<path d="M16 29C9 24 6 18 7 13c1-3 5-4 9-3 4-1 8 0 9 3 1 5-2 11-9 16z" fill="#eb5757" ${s()}/>
    <path d="M10 10l3-4 3 3 3-3 3 4" fill="#5a9e3a" ${s(1)}/><g fill="#ffe082"><circle cx="12" cy="15" r=".8"/><circle cx="16" cy="14" r=".8"/><circle cx="20" cy="15" r=".8"/><circle cx="14" cy="19" r=".8"/><circle cx="18" cy="19" r=".8"/><circle cx="16" cy="23" r=".8"/></g>`,
  melon: `<circle cx="16" cy="18" r="11" fill="#a5d6a7" ${s()}/><path d="M7 13l18 10M7 23l18-10M16 7v22M5 18h22" ${s(.8)} opacity=".7"/>
    <path d="M16 7c0-2 1-4 3-5" ${s(1.6)} fill="none"/>`,
  watermelon: `<path d="M3 13a13 13 0 0 0 26 0z" fill="#43a047" ${s()}/><path d="M5.5 13a10.5 10.5 0 0 0 21 0z" fill="#ef5350"/>
    <g fill="${O}"><ellipse cx="11" cy="17" rx=".8" ry="1.2"/><ellipse cx="16" cy="19" rx=".8" ry="1.2"/><ellipse cx="21" cy="17" rx=".8" ry="1.2"/></g>`,
  mikan: `<circle cx="16" cy="18" r="10.5" fill="#f2994a" ${s()}/><path d="M16 8c1-3 4-4 7-3-1 3-4 4-7 3z" fill="#5a9e3a" ${s(1)}/>
    <g fill="#c96b16"><circle cx="12" cy="14" r=".7"/><circle cx="20" cy="16" r=".7"/><circle cx="14" cy="22" r=".7"/></g>`,
  apple: `<path d="M16 10c-4-3-11-2-11 7 0 7 5 12 8 12 2 0 2-1 3-1s1 1 3 1c3 0 8-5 8-12 0-9-7-10-11-7z" fill="#e53935" ${s()}/>
    <path d="M16 10c0-3 1-5 2-7" ${s(1.6)} fill="none"/><path d="M18 7c2-2 5-2 7 0-2 2-5 2-7 0z" fill="#5a9e3a" ${s(1)}/>`,
  grape: `<path d="M16 4v4" ${s(1.6)}/><path d="M17 6c3-2 6-1 7 1-3 1-5 1-7-1z" fill="#5a9e3a" ${s(1)}/>
    <g fill="#7e57c2" ${s(1)}><circle cx="11" cy="11" r="3"/><circle cx="17" cy="11" r="3"/><circle cx="22" cy="12" r="3"/><circle cx="14" cy="16" r="3"/><circle cx="20" cy="17" r="3"/><circle cx="12" cy="21" r="3"/><circle cx="18" cy="22" r="3"/><circle cx="15" cy="27" r="3"/></g>`,
  peach: `<path d="M16 9c-6-3-12 2-11 9 1 6 6 10 11 10s10-4 11-10c1-7-5-12-11-9z" fill="#ffab91" ${s()}/>
    <path d="M16 9c-2 5-2 12 0 19" ${s(1)} fill="none" opacity=".6"/><path d="M16 9c2-3 6-5 9-3-2 3-6 4-9 3z" fill="#5a9e3a" ${s(1)}/>`,
  pear: `<path d="M16 7c-3 0-4 3-4 6-3 2-5 5-5 9 0 5 4 8 9 8s9-3 9-8c0-4-2-7-5-9 0-3-1-6-4-6z" fill="#d4c26a" ${s()}/>
    <path d="M16 7V3" ${s(1.6)}/><g fill="#9b8a35"><circle cx="13" cy="20" r=".7"/><circle cx="19" cy="22" r=".7"/><circle cx="16" cy="25" r=".7"/></g>`,
  cherry: `<path d="M10 22c2-7 4-13 9-18M22 22c-1-6-2-12-3-18" ${s(1.4)} fill="none"/><path d="M19 4c3-1 6 0 8 2-3 1-6 1-8-2z" fill="#5a9e3a" ${s(1)}/>
    <circle cx="10" cy="24" r="5" fill="#d32f2f" ${s()}/><circle cx="22" cy="24" r="5" fill="#d32f2f" ${s()}/><circle cx="8.5" cy="22.5" r="1.2" fill="#fff" opacity=".6"/>`,
  ume: `<g fill="#f8bbd0" ${s(1)}><circle cx="16" cy="8.5" r="5"/><circle cx="23.5" cy="14" r="5"/><circle cx="20.5" cy="23" r="5"/><circle cx="11.5" cy="23" r="5"/><circle cx="8.5" cy="14" r="5"/></g><circle cx="16" cy="16" r="3" fill="#f2c94c" ${s(1)}/>`,
  kaki: `<path d="M5 18c0-6 5-9 11-9s11 3 11 9-5 10-11 10S5 24 5 18z" fill="#f2994a" ${s()}/>
    <path d="M9 11l7 3 7-3-3-3-4 2-4-2z" fill="#5a9e3a" ${s(1)}/>`,
  tea: `<path d="M16 29V16" ${s()} fill="none"/><path d="M16 17C8 16 5 10 6 4c7 0 11 5 10 13z" fill="#558b2f" ${s()}/>
    <path d="M16 20c6 0 10-4 10-10-6 0-10 4-10 10z" fill="#7cb342" ${s()}/>`,
  sugarcane: `<g fill="#a5d6a7" ${s(1.2)}><rect x="9" y="6" width="4" height="23" rx="1.5"/><rect x="18" y="4" width="4" height="25" rx="1.5"/></g>
    <path d="M9 13h4M9 20h4M18 11h4M18 18h4M18 25h4" ${s(1)}/><path d="M20 4c-3-2-6-2-9 0M11 6c2-3 5-4 8-3" ${s(1.4)} stroke="#43a047" fill="none"/>`,
  beet: `<path d="M8 13c0-3 4-4 8-4s8 1 8 4c0 6-4 12-8 17-4-5-8-11-8-17z" fill="#f5f0e1" ${s()}/>
    <path d="M14 9c-2-4-5-6-8-6M16 9V2M18 9c2-4 5-6 8-6" ${s(1.6)} stroke="#43a047" fill="none"/>`,
  konnyaku: `<rect x="6" y="9" width="20" height="16" rx="3" fill="#8d8d8d" ${s()}/><g fill="#555"><circle cx="11" cy="14" r=".7"/><circle cx="17" cy="13" r=".7"/><circle cx="21" cy="18" r=".7"/><circle cx="13" cy="20" r=".7"/></g>`,
  igusa: `<path d="M5 26h22v-4H5z" fill="#c5b358" ${s()}/><path d="M8 22c1-8 2-14 2-19M13 22c0-8 1-14 3-19M18 22c0-8-1-14 0-19M23 22c-1-8-3-14-2-19" ${s(1.4)} stroke="#689f38" fill="none"/>`,
  pumpkin: `<path d="M16 9c-7 0-12 4-12 10s5 9 12 9 12-3 12-9-5-10-12-10z" fill="#3f6b3a" ${s()}/><path d="M16 9c-3 4-3 15 0 19M16 9c3 4 3 15 0 19M9 11c-2 5-1 13 3 16M23 11c2 5 1 13-3 16" ${s(1)} stroke="#2a4a27" fill="none"/>
    <path d="M16 9c0-3 1-5 3-6" ${s(2)} stroke="#6d4c41" fill="none"/>`,
  corn: `<path d="M16 3c4 0 6 6 6 12s-2 12-6 12-6-6-6-12 2-12 6-12z" fill="#f6cf4a" ${s()}/><path d="M12 9h8M11 14h10M11 19h10M12 24h8M16 4v23" stroke="#c99a12" stroke-width="1"/>
    <path d="M10 15c-3 5-3 11 3 15M22 15c3 5 3 11-3 15" fill="#7cb342" ${s(1.2)}/>`,
  spinach: `<path d="M16 30V16" ${s(1.6)} stroke="#c2185b"/><path d="M16 17C9 16 5 11 7 4c6 1 10 6 9 13z" fill="#2e7d32" ${s()}/><path d="M16 19c6-1 10-6 9-13-6 1-9 6-9 13z" fill="#43a047" ${s()}/><path d="M16 22c-4 0-7-2-8-5" ${s(1)} fill="none"/>`,
  garlic: `<path d="M16 6c-6 4-11 9-11 14 0 5 5 8 11 8s11-3 11-8c0-5-5-10-11-14z" fill="#faf6ee" ${s()}/><path d="M16 6v22M11 10c-2 5-2 12 1 18M21 10c2 5 2 12-1 18" ${s(1)} fill="none"/><path d="M16 6V2" ${s(1.6)}/>`,
  ginger: `<path d="M5 20c0-4 3-6 6-5 0-4 3-6 6-5 1-3 5-4 7-2 3 2 3 6 0 8-1 4-4 6-8 5-2 3-6 4-9 3-2-1-2-2-2-4z" fill="#e6c27a" ${s()}/><path d="M11 15c1 2 1 4 0 6M17 10c1 2 1 4 0 7" ${s(1)} fill="none" opacity=".6"/>`,
  renkon: `<circle cx="16" cy="16" r="12" fill="#f3e3c3" ${s()}/><g fill="#fff" ${s(1)}><circle cx="16" cy="16" r="2.6"/><circle cx="16" cy="9" r="2.4"/><circle cx="22.5" cy="13" r="2.4"/><circle cx="21" cy="21" r="2.4"/><circle cx="11" cy="21" r="2.4"/><circle cx="9.5" cy="13" r="2.4"/></g>`,
  chestnut: `<path d="M16 6c-5 4-11 8-11 15 0 4 5 7 11 7s11-3 11-7c0-7-6-11-11-15z" fill="#8d5524" ${s()}/><path d="M6 21c3 2 7 3 10 3s7-1 10-3c0 4-5 7-10 7S6 25 6 21z" fill="#e8c9a0" ${s(1)}/><path d="M16 6l0-3" ${s(1.6)}/>`,
  kiwi: `<circle cx="16" cy="16" r="12" fill="#8d6e3f" ${s()}/><circle cx="16" cy="16" r="10" fill="#8bc34a"/><circle cx="16" cy="16" r="4" fill="#f1f8e9"/>
    <g fill="${O}">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="16" cy="9.5" rx=".7" ry="1.2" transform="rotate(${a} 16 16)"/>`).join('')}</g>`,
  biwa: `<g fill="#f5a623" ${s(1.2)}><ellipse cx="12" cy="19" rx="6" ry="7.5"/><ellipse cx="21" cy="17" rx="6" ry="7.5"/></g><path d="M16 6c0-2 2-3 4-3M17 4c4-1 7 1 9 4-4 1-7 0-9-4z" fill="#558b2f" ${s(1)}/>`,
  soba: `<path d="M5 15h22c0 7-5 12-11 12S5 22 5 15z" fill="#6d4c41" ${s()}/><path d="M8 15c1-4 2-8 1-11M12 15c0-4 1-8 0-12M16 15c0-4 0-8 1-12M20 15c0-4-1-8 0-11M24 15c-1-4-2-7-1-10" stroke="#b08968" stroke-width="1.6" fill="none"/>`,
  lapear: `<path d="M16 5c-2 0-3 2-3 5-1 3-6 6-6 12 0 4 4 7 9 7s9-3 9-7c0-6-5-9-6-12 0-3-1-5-3-5z" fill="#c5d86d" ${s()}/><path d="M16 5V2" ${s(1.6)}/><path d="M17 4c2-2 5-2 7 0-2 1-5 1-7 0z" fill="#5a9e3a" ${s(1)}/>`,
  pearl: `<path d="M4 20c0-7 5-12 12-12s12 5 12 12c-4 4-8 6-12 6S8 24 4 20z" fill="#b0bec5" ${s()}/><circle cx="16" cy="18" r="5" fill="#fff" ${s(1.2)}/><circle cx="14.5" cy="16.5" r="1.4" fill="#e1f5fe"/>`,
  wakame: `<path d="M10 29c-4-6 4-9 0-15s4-9 2-12M17 29c-3-6 5-9 1-15s3-8 2-12M23 29c-3-5 4-8 1-13" stroke="#2e7d32" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M10 29c-4-6 4-9 0-15s4-9 2-12M17 29c-3-6 5-9 1-15s3-8 2-12M23 29c-3-5 4-8 1-13" stroke="${O}" stroke-width=".8" fill="none" opacity=".5"/>`,
  eel: `<path d="M3 14c3-4 7-4 10 0s7 4 10 0 5-3 6-1c-1 3-3 5-6 5-3 0-5-3-10-3-3 0-6 3-9 2z" fill="#455a64" ${s()}/><circle cx="26" cy="13.5" r=".9" fill="#fff"/><path d="M4 20c2 2 5 2 7 0" ${s(1)} stroke="#2f80ed" fill="none"/>`,
  madai: `<path d="M3 16c4-6 11-9 18-6l7-4-2 10 2 10-7-4c-7 3-14 0-18-6z" fill="#ef7b8b" ${s()}/><circle cx="9" cy="15" r="1.4" fill="${O}"/><path d="M12 8c3 1 6 1 8 3" ${s(1)} fill="none"/>`,
  oil: `<path d="M9 9h14v18a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill="#455a64" ${s()}/><ellipse cx="16" cy="9" rx="7" ry="2.2" fill="#78909c" ${s()}/><path d="M9 15h14M9 21h14" stroke="#90a4ae" stroke-width="1.4"/><path d="M16 2c-2 3-2 4 0 5 2-1 2-2 0-5z" fill="#111" ${s(1)}/>`,
  print: `<path d="M8 4h16v8H8z" fill="#fff" ${s()}/><path d="M4 12h24v12H4z" fill="#5c6bc0" ${s()}/><path d="M8 20h16v9H8z" fill="#fff" ${s()}/><path d="M11 23h10M11 26h7" ${s(1)}/><circle cx="24" cy="15.5" r="1.2" fill="#ffd54f"/>`,
  flower: `<g fill="#f48fb1" ${s(1)}><circle cx="16" cy="9" r="4.5"/><circle cx="23" cy="14" r="4.5"/><circle cx="20" cy="22" r="4.5"/><circle cx="12" cy="22" r="4.5"/><circle cx="9" cy="14" r="4.5"/></g><circle cx="16" cy="16" r="3.2" fill="#ffd54f" ${s(1)}/>`,
  // ───────── 畜産・水産 ─────────
  cow: `<path d="M6 13c0-3 3-5 6-5h8c3 0 6 2 6 5v6c0 4-4 7-10 7S6 23 6 19z" fill="#8d6e63" ${s()}/>
    <path d="M7 10L3 7M25 10l4-3" ${s(1.6)}/><ellipse cx="16" cy="21" rx="6" ry="3.6" fill="#f0c3a8" ${s(1)}/><g fill="${O}"><circle cx="13" cy="21" r=".9"/><circle cx="19" cy="21" r=".9"/><circle cx="12" cy="14" r="1.1"/><circle cx="20" cy="14" r="1.1"/></g>`,
  dairy: `<path d="M6 13c0-3 3-5 6-5h8c3 0 6 2 6 5v6c0 4-4 7-10 7S6 23 6 19z" fill="#fff" ${s()}/>
    <path d="M8 9c2 2 4 2 5 5M24 10c-1 2-3 3-3 6" ${s(0)} fill="none"/><path d="M7 15c2-1 4-3 4-6-3 0-5 2-4 6zM25 12c-2 1-3 4-2 6 2-1 3-4 2-6z" fill="${O}"/>
    <path d="M7 10L3 7M25 10l4-3" ${s(1.6)}/><ellipse cx="16" cy="21" rx="6" ry="3.6" fill="#f8bbd0" ${s(1)}/><g fill="${O}"><circle cx="13" cy="21" r=".9"/><circle cx="19" cy="21" r=".9"/><circle cx="12.5" cy="14.5" r="1.1"/><circle cx="19.5" cy="14.5" r="1.1"/></g>`,
  pig: `<circle cx="16" cy="17" r="11" fill="#f8bbd0" ${s()}/><path d="M7 9l-1-5 5 3M25 9l1-5-5 3" fill="#f48fb1" ${s(1)}/>
    <ellipse cx="16" cy="20" rx="5" ry="3.5" fill="#f48fb1" ${s(1)}/><g fill="${O}"><circle cx="14" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><circle cx="11.5" cy="14" r="1.1"/><circle cx="20.5" cy="14" r="1.1"/></g>`,
  chicken: `<path d="M9 28c-3-5-2-13 3-17 1-4 6-6 9-3 2 2 2 5 1 7 4 2 6 6 4 11z" fill="#fff" ${s()}/>
    <path d="M14 7c0-3 2-4 3-4 0 1 2 1 2 3-1 0-1 1-2 1" fill="#e53935" ${s(1)}/><path d="M22 11l4 1-4 2z" fill="#f2c94c" ${s(1)}/><circle cx="19" cy="10" r="1" fill="${O}"/>`,
  egg: `<ellipse cx="13" cy="18" rx="7" ry="9" fill="#fff8e1" ${s()}/><ellipse cx="21" cy="20" rx="6.5" ry="8" fill="#ffe0b2" ${s()}/>`,
  fish: `<path d="M4 16c4-6 11-8 17-6l7-4-2 10 2 10-7-4c-6 2-13 0-17-6z" fill="#64b5f6" ${s()}/><circle cx="10" cy="15" r="1.4" fill="${O}"/>
    <path d="M14 11c1 3 1 7 0 10" ${s(1)} fill="none"/>`,
  scallop: `<path d="M4 14c2-7 7-11 12-11s10 4 12 11c-3 6-7 10-12 10S7 20 4 14z" fill="#ffcc80" ${s()}/>
    <path d="M16 24V4M10 22L8 7M22 22l2-15M6 18l-2-6M26 18l2-6" ${s(1)} fill="none"/><path d="M11 24h10l-1 4h-8z" fill="#ffcc80" ${s(1)}/>`,
  oyster: `<path d="M5 18c0-8 6-13 12-13 6 0 10 5 10 10 0 7-6 12-13 12-5 0-9-4-9-9z" fill="#b0bec5" ${s()}/>
    <path d="M10 18c0-4 3-7 7-7s6 3 6 6-3 6-7 6-6-2-6-5z" fill="#eceff1" ${s(1)}/>`,
  nori: `<rect x="7" y="5" width="18" height="22" rx="1.5" fill="#2e4d2f" ${s()}/><path d="M10 10h12M10 16h12M10 22h12" stroke="#4e7a4f" stroke-width="1"/>`,
  shrimp: `<path d="M24 8c-8-1-15 4-16 12 0 4 3 7 7 6-3-2-3-6 0-8 4-3 10-3 12-8z" fill="#ff8a65" ${s()}/><path d="M24 8l5-4M24 9l5 0" ${s(1)}/>`,
  // ───────── 工業 ─────────
  car: `<path d="M3 20v-4l4-1 3-5h11l5 5h2l1 5z" fill="#2f80ed" ${s()}/><path d="M11 11h4v4H9zM17 11h3l3 4h-6z" fill="#cfe8ff" ${s(1)}/>
    <circle cx="9" cy="21" r="3" fill="#333" ${s(1)}/><circle cx="23" cy="21" r="3" fill="#333" ${s(1)}/>`,
  steel: `<path d="M4 22l6-6h18l-6 6z" fill="#90a4ae" ${s()}/><path d="M4 22h18v5H4zM22 22l6-6v5l-6 6z" fill="#607d8b" ${s()}/>
    <path d="M9 13l5-5h12l-5 5z" fill="#cfd8dc" ${s(1)}/>`,
  chemical: `<path d="M12 4h8M13 4v8L6 25c-1 2 0 3 2 3h16c2 0 3-1 2-3l-7-13V4" fill="#e3f2fd" ${s()}/>
    <path d="M9 20h14l3 5c0 1-1 2-2 2H8c-1 0-2-1-1-2z" fill="#26a69a"/><circle cx="14" cy="23" r="1.2" fill="#fff"/><circle cx="18" cy="21" r=".8" fill="#fff"/>`,
  chip: `<rect x="8" y="8" width="16" height="16" rx="2" fill="#37474f" ${s()}/><rect x="12" y="12" width="8" height="8" fill="#ffd54f"/>
    <path d="M11 8V4M16 8V4M21 8V4M11 24v4M16 24v4M21 24v4M8 11H4M8 16H4M8 21H4M24 11h4M24 16h4M24 21h4" ${s(1.4)}/>`,
  food: `<path d="M8 8h16v18a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="#ef5350" ${s()}/><ellipse cx="16" cy="8" rx="8" ry="2.5" fill="#cfd8dc" ${s()}/>
    <rect x="8" y="14" width="16" height="7" fill="#fff8e1"/><path d="M12 17.5h8" ${s(1)}/>`,
  factory: `<path d="M3 28V15l7 4v-4l7 4v-4l7 4V6h4v22z" fill="#bdbdbd" ${s()}/><path d="M24 6c0-2 2-3 4-3" ${s(1)} fill="none"/>
    <g fill="#ffe082"><rect x="6" y="21" width="3" height="3"/><rect x="13" y="21" width="3" height="3"/><rect x="20" y="21" width="3" height="3"/></g>`,
  ship: `<path d="M3 20h26l-4 7H7z" fill="#e53935" ${s()}/><path d="M8 20v-6h14v6" fill="#fff" ${s()}/><path d="M12 14V8h6v6" fill="#bdbdbd" ${s()}/>
    <path d="M2 29c3 0 3-1 6-1s3 1 6 1 3-1 6-1 3 1 6 1" ${s(1)} stroke="#2f80ed" fill="none"/>`,
  textile: `<path d="M5 9c0-3 2-4 5-4h12c3 0 5 1 5 4v14c0 3-2 4-5 4H10c-3 0-5-1-5-4z" fill="#ce93d8" ${s()}/><path d="M5 12h22M5 17h22M5 22h22M11 5v22M16 5v22M21 5v22" stroke="#8e24aa" stroke-width=".8"/>`,
  paper: `<path d="M7 4h13l5 5v19H7z" fill="#fff" ${s()}/><path d="M20 4v5h5" fill="#e0e0e0" ${s(1)}/><path d="M10 13h12M10 17h12M10 21h9" ${s(1)}/>`,
  instrument: `<path d="M10 4h4v13a5 5 0 1 1-4 0z" fill="#8d6e63" ${s()}/><path d="M18 4h4v13a5 5 0 1 1-4 0z" fill="#ffcc80" ${s()}/>`,
  // ───────── 世界遺産 ─────────
  pagoda: `<path d="M16 2v4" ${s(1.4)}/><g fill="#c0392b" ${s(1)}><path d="M8 9h16l-3-3H11z"/><path d="M7 15h18l-3-3H10z"/><path d="M6 21h20l-3-3H9z"/><path d="M5 27h22l-3-3H8z"/></g>
    <g fill="#fdf0d5" ${s(1)}><rect x="12" y="9" width="8" height="3"/><rect x="11" y="15" width="10" height="3"/><rect x="10" y="21" width="12" height="3"/><rect x="9" y="27" width="14" height="3"/></g>`,
  castle: `<path d="M5 29h22v-4H5z" fill="#9e9e9e" ${s()}/><path d="M7 25h18v-6H7z" fill="#fff" ${s()}/><path d="M4 19l12-5 12 5z" fill="#455a64" ${s()}/>
    <path d="M10 14h12v-4H10z" fill="#fff" ${s()}/><path d="M8 10l8-5 8 5z" fill="#455a64" ${s()}/><path d="M13 21h2v4h-2zM18 21h2v4h-2z" fill="${O}"/>`,
  forest: `<path d="M11 3L3 17h5l-4 7h14l-4-7h5z" fill="#2e7d32" ${s()}/><path d="M22 7l-6 11h4l-4 7h13l-4-7h4z" fill="#43a047" ${s()}/>
    <path d="M11 24v5M22 25v4" ${s(2)}/>`,
  temple: `<path d="M3 13L16 5l13 8z" fill="#5d4037" ${s()}/><path d="M6 13h20v3H6z" fill="#8d6e63" ${s()}/><path d="M8 16h16v10H8z" fill="#fdf0d5" ${s()}/>
    <path d="M12 16v10M16 16v10M20 16v10" ${s(1)}/><path d="M4 26h24v3H4z" fill="#9e9e9e" ${s()}/>`,
  gassho: `<path d="M16 3L4 27h24z" fill="#a1887f" ${s()}/><path d="M16 3L9 17h14z" fill="#8d6e63"/><path d="M11 27v-7h10v7" fill="#fdf0d5" ${s()}/>
    <path d="M14 20v7M18 20v7" ${s(1)}/><path d="M12 15h3v3h-3zM17 15h3v3h-3z" fill="#ffe082" ${s(.8)}/><path d="M5 26c3-1 6-1 8 0" stroke="#fff" stroke-width="2"/>`,
  dome: `<path d="M8 29V15h16v14z" fill="#bcaaa4" ${s()}/><path d="M10 15c0-6 3-9 6-9s6 3 6 9" fill="none" ${s(1.6)}/>
    <path d="M13 15c0-4 1-6 3-6M19 15c0-4-1-6-3-6M16 6v9" ${s(1)} fill="none"/><path d="M11 19h3v4h-3zM18 19h3v4h-3z" fill="${O}"/><path d="M5 29h22" ${s()}/>`,
  torii: `<path d="M3 7c5 2 21 2 26 0l-1 4H4z" fill="#e53935" ${s()}/><path d="M6 14h20v2.5H6z" fill="#e53935" ${s()}/>
    <path d="M8.5 11v15M23.5 11v15" ${s(3)} stroke="#e53935"/><path d="M8.5 11v15M23.5 11v15" ${s(.8)} fill="none"/>
    <path d="M2 27c3 1 5 1 8 0s5-1 8 0 5 1 8 0" stroke="#2f80ed" stroke-width="1.6" fill="none"/>`,
  shrine: `<path d="M2 14L16 4l14 10z" fill="#2e7d32" ${s()}/><path d="M6 14h20v12H6z" fill="#ffd54f" ${s()}/><path d="M6 17h20" stroke="#e53935" stroke-width="2"/>
    <path d="M13 20h6v6h-6z" fill="#e53935" ${s(1)}/><path d="M4 26h24v3H4z" fill="#9e9e9e" ${s()}/>`,
  gusuku: `<path d="M4 29V15c4-2 6 0 8-2s4-3 8-1 6 1 8 0v17z" fill="#e0c9a6" ${s()}/><path d="M12 29v-7a4 4 0 0 1 8 0v7" fill="${O}"/>
    <path d="M4 19h24M4 24h8M20 24h8" ${s(.8)} opacity=".6"/>`,
  path: `<path d="M4 29c6-4 3-9 9-12s5-8 12-13" fill="none" stroke="#a1887f" stroke-width="5" stroke-linecap="round"/>
    <path d="M4 29c6-4 3-9 9-12s5-8 12-13" fill="none" stroke="#fdf0d5" stroke-width="1.6" stroke-dasharray="2 2.5"/>
    <path d="M23 18l-3 6h6z" fill="#2e7d32" ${s(1)}/><path d="M8 6l-3 7h6z" fill="#2e7d32" ${s(1)}/><path d="M23 24v3M8 13v3" ${s(1.4)}/>`,
  seal: `<path d="M3 23c4-6 11-8 18-6 3 1 6 0 7-2 0 4-2 7-6 8 1 2 0 4-2 4-1-2-3-2-5-2-5 0-9 0-12-2z" fill="#90a4ae" ${s()}/><circle cx="24" cy="17" r=".9" fill="${O}"/>
    <path d="M3 12l6-2 5 2 6-3 6 2v3H3z" fill="#e3f2fd" ${s(1)}/>`,
  mine: `<path d="M3 29c2-9 7-15 13-15s11 6 13 15z" fill="#8d6e63" ${s()}/><path d="M11 29v-5a5 5 0 0 1 10 0v5" fill="${O}"/>
    <path d="M7 9l10 6M17 6c-3 0-6 1-8 3 2 0 4 0 6 2" ${s(1.4)} fill="#bdbdbd"/><g fill="#ffd54f" ${s(.8)}><path d="M23 6l2-2 2 2-2 2z"/><path d="M26 11l1.5-1.5L29 11l-1.5 1.5z"/></g>`,
  island: `<path d="M2 24c4-2 8-7 14-7s10 5 14 7z" fill="#ffe0b2" ${s()}/><path d="M16 18c0-5 1-9 3-12" ${s(1.6)} fill="none"/>
    <path d="M19 6c-3-2-7-1-9 1 3 0 5 0 9-1zM19 6c2-3 6-3 8-1-3 0-5 0-8 1zM19 6c0 3-2 5-4 6 0-2 1-4 4-6z" fill="#43a047" ${s(1)}/>
    <path d="M2 28c3 0 3-1 6-1s3 1 6 1 3-1 6-1 3 1 6 1" stroke="#2f80ed" stroke-width="1.6" fill="none"/>`,
  fuji: `<path d="M2 27l10-15c2-2 6-2 8 0l10 15z" fill="#5c6bc0" ${s()}/><path d="M12 12c2-2 6-2 8 0l3 4c-2 1-3-1-5 0s-3-1-4 0-2-1-5 0z" fill="#fff" ${s(1)}/>
    <circle cx="26" cy="7" r="3" fill="#ef5350"/>`,
  silk: `<path d="M3 29V14l8-5v5l8-5v5l8-5v20z" fill="#d7ccc8" ${s()}/><path d="M6 18h4v4H6zM14 18h4v4h-4zM22 18h3v4h-3z" fill="#fff" ${s(.8)}/>
    <ellipse cx="25" cy="5" rx="4" ry="2.6" fill="#fff" ${s(1)}/>`,
  museum: `<path d="M4 12h24v4H4z" fill="#eeeeee" ${s()}/><path d="M6 16h20v10H6z" fill="#e0e0e0" ${s()}/>
    <path d="M9 26V16M13 26V16M17 26V16M21 26V16" ${s(1)}/><path d="M4 26h24v3H4z" fill="#9e9e9e" ${s()}/><path d="M6 12V7h20v5" fill="#bdbdbd" ${s()}/>`,
  church: `<path d="M16 2v6M13 4h6" ${s(1.6)}/><path d="M9 14l7-6 7 6v15H9z" fill="#f5f5f5" ${s()}/><path d="M7 15l9-8 9 8" fill="none" ${s(1.6)} stroke="#5d4037"/>
    <path d="M14 29v-6a2 2 0 0 1 4 0v6" fill="${O}"/><circle cx="16" cy="16" r="2.4" fill="#64b5f6" ${s(1)}/>`,
  kofun: `<path d="M16 28c-5 0-9-3-9-7 0-3 2-5 5-6l-4-8h16l-4 8c3 1 5 3 5 6 0 4-4 7-9 7z" fill="#66bb6a" ${s()}/>
    <path d="M16 28c-7 0-11-4-11-8 0-3 2-5 5-7L6 5h20l-4 8c3 2 5 4 5 7 0 4-4 8-11 8z" fill="none" stroke="#64b5f6" stroke-width="1.6"/>`,
  jomon: `<path d="M8 29c0-6 1-9 3-11l-3-1c0-6 4-10 8-11 4 1 8 5 8 11l-3 1c2 2 3 5 3 11z" fill="#bf8f5c" ${s()}/>
    <path d="M10 22c2 1 4-1 6 0s4 1 6 0M10 25c2 1 4-1 6 0s4 1 6 0" ${s(1)} fill="none"/><path d="M11 12l5-4 5 4" ${s(1)} fill="none"/>`,
  // ───────── 地図記号まわり ─────────
  capital: `<circle cx="16" cy="16" r="10" fill="#fff" ${s(2)}/><circle cx="16" cy="16" r="5" fill="${O}"/>`,
  city: `<circle cx="16" cy="16" r="9" fill="#ffd54f" ${s(2)}/><circle cx="16" cy="16" r="3.5" fill="${O}"/>`,
  craft: `<path d="M6 12c0-3 4-5 10-5s10 2 10 5c0 9-4 15-10 15S6 21 6 12z" fill="#c0392b" ${s()}/><ellipse cx="16" cy="12" rx="9" ry="3" fill="#2d2d2d" ${s(1)}/><path d="M11 18c3 2 7 2 10 0" stroke="#f2c94c" stroke-width="1.4" fill="none"/>`,
  population: `<circle cx="11" cy="10" r="4" fill="#ffcc80" ${s()}/><circle cx="21" cy="10" r="4" fill="#90caf9" ${s()}/>
    <path d="M4 27c0-6 3-10 7-10s7 4 7 10zM14 27c0-6 3-10 7-10s7 4 7 10z" fill="#4db6ac" ${s()}/>`,
};

export function icon(name, size = 28, extra = '') {
  const body = ICONS[name] || ICONS.factory;
  return `<svg class="ic" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" ${extra}>${body}</svg>`;
}

// 地図SVG用の <symbol> 定義
export function symbolDefs() {
  return Object.entries(ICONS)
    .map(([k, v]) => `<symbol id="ic-${k}" viewBox="0 0 32 32">${v}</symbol>`)
    .join('');
}
