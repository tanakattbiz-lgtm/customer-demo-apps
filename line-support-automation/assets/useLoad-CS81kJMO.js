import{c as i,j as s,r}from"./index-DH0vvcl5.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=i("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);function x({title:e,subtitle:t,actions:a}){return s.jsxs("div",{className:"mb-6 flex flex-wrap items-end justify-between gap-3",children:[s.jsxs("div",{children:[s.jsx("h1",{className:"text-xl font-bold text-ink-900 sm:text-2xl",children:e}),t&&s.jsx("p",{className:"mt-1 text-sm text-ink-500",children:t})]}),a&&s.jsx("div",{className:"flex items-center gap-2",children:a})]})}async function c(e,t=420){return await new Promise(a=>setTimeout(a,t+Math.random()*320)),e}function o(e=520){const[t,a]=r.useState(!0);return r.useEffect(()=>{let n=!0;return c(!0,e).then(()=>n&&a(!1)),()=>{n=!1}},[e]),t}export{x as P,d as S,c as f,o as u};
