import{c as f,r}from"./index-CyGhb6mY.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=f("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);async function l(e,t=380){return await new Promise(a=>setTimeout(a,t+Math.random()*320)),e}function m(e,t,a=480){const[c,u]=r.useState(null),[i,n]=r.useState(!0);return r.useEffect(()=>{let s=!0;return n(!0),l(e(),a).then(o=>{s&&(u(o),n(!1))}),()=>{s=!1}},t),{data:c,loading:i}}export{p as M,m as u};
