import{r as e}from"./chunk-DECur_0Z.js";import{$ as t,F as n,N as r,P as i,T as a,Z as o,_ as s,a as c,c as l,i as u,it as d,l as f,m as p,o as m,s as h,tt as g,u as _}from"./createSimplePaletteValueFilter-DbUAm8nL.js";var v=`modulepreload`,y=function(e){return`/`+e},b={},x=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=y(t,n),t in b)return;b[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:v,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};function S(e){try{return e.matches(`:focus-visible`)}catch{}return!1}var C=f,w=e(d()),T=class e{static create(){return new e}static use(){let t=l(e.create).current,[n,r]=w.useState(!1);return t.shouldMount=n,t.setShouldMount=r,w.useEffect(t.mountEffect,[n]),t}constructor(){this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}mount(){return this.mounted||(this.mounted=E(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}mountEffect=()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())};start(...e){this.mount().then(()=>this.ref.current?.start(...e))}stop(...e){this.mount().then(()=>this.ref.current?.stop(...e))}pulsate(...e){this.mount().then(()=>this.ref.current?.pulsate(...e))}};function ee(){return T.use()}function E(){let e,t,n=new Promise((n,r)=>{e=n,t=r});return n.resolve=e,n.reject=t,n}function D(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function O(e,t){var n=function(e){return t&&(0,w.isValidElement)(e)?t(e):e},r=Object.create(null);return e&&w.Children.map(e,function(e){return e}).forEach(function(e){r[e.key]=n(e)}),r}function k(e,t){e||={},t||={};function n(n){return n in t?t[n]:e[n]}var r=Object.create(null),i=[];for(var a in e)a in t?i.length&&(r[a]=i,i=[]):i.push(a);var o,s={};for(var c in t){if(r[c])for(o=0;o<r[c].length;o++){var l=r[c][o];s[r[c][o]]=n(l)}s[c]=n(c)}for(o=0;o<i.length;o++)s[i[o]]=n(i[o]);return s}function A(e,t,n){return n[t]==null?e.props[t]:n[t]}function j(e,t){return O(e.children,function(n){return(0,w.cloneElement)(n,{onExited:t.bind(null,n),in:!0,appear:A(n,`appear`,e),enter:A(n,`enter`,e),exit:A(n,`exit`,e)})})}function M(e,t,n){var r=O(e.children),i=k(t,r);return Object.keys(i).forEach(function(a){var o=i[a];if((0,w.isValidElement)(o)){var s=a in t,c=a in r,l=t[a],u=(0,w.isValidElement)(l)&&!l.props.in;c&&(!s||u)?i[a]=(0,w.cloneElement)(o,{onExited:n.bind(null,o),in:!0,exit:A(o,`exit`,e),enter:A(o,`enter`,e)}):!c&&s&&!u?i[a]=(0,w.cloneElement)(o,{in:!1}):c&&s&&(0,w.isValidElement)(l)&&(i[a]=(0,w.cloneElement)(o,{onExited:n.bind(null,o),in:l.props.in,exit:A(o,`exit`,e),enter:A(o,`enter`,e)}))}}),i}var N=Object.values||function(e){return Object.keys(e).map(function(t){return e[t]})},P={component:`div`,childFactory:function(e){return e}},F=function(e){m(t,e);function t(t,n){var r=e.call(this,t,n)||this;return r.state={contextValue:{isMounting:!0},handleExited:r.handleExited.bind(D(r)),firstRender:!0},r}var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(e,t){var n=t.children,r=t.handleExited;return{children:t.firstRender?j(e,r):M(e,n,r),firstRender:!1}},n.handleExited=function(e,t){var n=O(this.props.children);e.key in n||(e.props.onExited&&e.props.onExited(t),this.mounted&&this.setState(function(t){var n=g({},t.children);return delete n[e.key],{children:n}}))},n.render=function(){var e=this.props,t=e.component,n=e.childFactory,r=h(e,[`component`,`childFactory`]),i=this.state.contextValue,a=N(this.state.children).map(n);return delete r.appear,delete r.enter,delete r.exit,t===null?w.createElement(c.Provider,{value:i},a):w.createElement(c.Provider,{value:i},w.createElement(t,r,a))},t}(w.Component);F.propTypes={},F.defaultProps=P;var I=o();function L(e){let{className:t,classes:r,pulsate:i=!1,rippleX:a,rippleY:o,rippleSize:s,in:c,onExited:l,timeout:u}=e,[d,f]=w.useState(!1),p=n(t,r.ripple,r.rippleVisible,i&&r.ripplePulsate),m={width:s,height:s,top:-(s/2)+o,left:-(s/2)+a},h=n(r.child,d&&r.childLeaving,i&&r.childPulsate);return!c&&!d&&f(!0),w.useEffect(()=>{if(!c&&l!=null){let e=setTimeout(l,u);return()=>{clearTimeout(e)}}},[l,c,u]),(0,I.jsx)(`span`,{className:p,style:m,children:(0,I.jsx)(`span`,{className:h})})}var R=r(`MuiTouchRipple`,[`root`,`ripple`,`rippleVisible`,`ripplePulsate`,`child`,`childLeaving`,`childPulsate`]),z=550,B=t`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,V=t`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,H=t`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,U=s(`span`,{name:`MuiTouchRipple`,slot:`Root`})({overflow:`hidden`,pointerEvents:`none`,position:`absolute`,zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:`inherit`}),W=s(L,{name:`MuiTouchRipple`,slot:`Ripple`})`
  opacity: 0;
  position: absolute;

  &.${R.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${B};
    animation-duration: ${z}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  &.${R.ripplePulsate} {
    animation-duration: ${({theme:e})=>e.transitions.duration.shorter}ms;
  }

  & .${R.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${R.childLeaving} {
    opacity: 0;
    animation-name: ${V};
    animation-duration: ${z}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  & .${R.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${H};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,G=w.forwardRef(function(e,t){let{center:r=!1,classes:i={},className:a,...o}=p({props:e,name:`MuiTouchRipple`}),[s,c]=w.useState([]),l=w.useRef(0),d=w.useRef(null);w.useEffect(()=>{d.current&&=(d.current(),null)},[s]);let f=w.useRef(!1),m=u(),h=w.useRef(null),g=w.useRef(null),_=w.useCallback(e=>{let{pulsate:t,rippleX:r,rippleY:a,rippleSize:o,cb:s}=e;c(e=>[...e,(0,I.jsx)(W,{classes:{ripple:n(i.ripple,R.ripple),rippleVisible:n(i.rippleVisible,R.rippleVisible),ripplePulsate:n(i.ripplePulsate,R.ripplePulsate),child:n(i.child,R.child),childLeaving:n(i.childLeaving,R.childLeaving),childPulsate:n(i.childPulsate,R.childPulsate)},timeout:z,pulsate:t,rippleX:r,rippleY:a,rippleSize:o},l.current)]),l.current+=1,d.current=s},[i]),v=w.useCallback((e={},t={},n=()=>{})=>{let{pulsate:i=!1,center:a=r||t.pulsate,fakeElement:o=!1}=t;if(e?.type===`mousedown`&&f.current){f.current=!1;return}e?.type===`touchstart`&&(f.current=!0);let s=o?null:g.current,c=s?s.getBoundingClientRect():{width:0,height:0,left:0,top:0},l,u,d;if(a||e===void 0||e.clientX===0&&e.clientY===0||!e.clientX&&!e.touches)l=Math.round(c.width/2),u=Math.round(c.height/2);else{let{clientX:t,clientY:n}=e.touches&&e.touches.length>0?e.touches[0]:e;l=Math.round(t-c.left),u=Math.round(n-c.top)}if(a)d=Math.sqrt((2*c.width**2+c.height**2)/3),d%2==0&&(d+=1);else{let e=Math.max(Math.abs((s?s.clientWidth:0)-l),l)*2+2,t=Math.max(Math.abs((s?s.clientHeight:0)-u),u)*2+2;d=Math.sqrt(e**2+t**2)}e?.touches?h.current===null&&(h.current=()=>{_({pulsate:i,rippleX:l,rippleY:u,rippleSize:d,cb:n})},m.start(80,()=>{h.current&&=(h.current(),null)})):_({pulsate:i,rippleX:l,rippleY:u,rippleSize:d,cb:n})},[r,_,m]),y=w.useCallback(()=>{v({},{pulsate:!0})},[v]),b=w.useCallback((e,t)=>{if(m.clear(),e?.type===`touchend`&&h.current){h.current(),h.current=null,m.start(0,()=>{b(e,t)});return}h.current=null,c(e=>e.length>0?e.slice(1):e),d.current=t},[m]);return w.useImperativeHandle(t,()=>({pulsate:y,start:v,stop:b}),[y,v,b]),(0,I.jsx)(U,{className:n(R.root,i.root,a),ref:g,...o,children:(0,I.jsx)(F,{component:null,exit:!0,children:s})})});function K(e){return i(`MuiButtonBase`,e)}var q=r(`MuiButtonBase`,[`root`,`disabled`,`focusVisible`]),te=e=>{let{disabled:t,focusVisible:n,focusVisibleClassName:r,classes:i}=e,o=a({root:[`root`,t&&`disabled`,n&&`focusVisible`]},K,i);return n&&r&&(o.root+=` ${r}`),o},ne=s(`button`,{name:`MuiButtonBase`,slot:`Root`})({display:`inline-flex`,alignItems:`center`,justifyContent:`center`,position:`relative`,boxSizing:`border-box`,WebkitTapHighlightColor:`transparent`,backgroundColor:`transparent`,outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:`pointer`,userSelect:`none`,verticalAlign:`middle`,MozAppearance:`none`,WebkitAppearance:`none`,textDecoration:`none`,color:`inherit`,"&::-moz-focus-inner":{borderStyle:`none`},[`&.${q.disabled}`]:{pointerEvents:`none`,cursor:`default`},"@media print":{colorAdjust:`exact`}}),J=w.forwardRef(function(e,t){let r=p({props:e,name:`MuiButtonBase`}),{action:i,centerRipple:a=!1,children:o,className:s,component:c=`button`,disabled:l=!1,disableRipple:u=!1,disableTouchRipple:d=!1,focusRipple:f=!1,focusVisibleClassName:m,LinkComponent:h=`a`,onBlur:g,onClick:v,onContextMenu:y,onDragLeave:b,onFocus:x,onFocusVisible:T,onKeyDown:E,onKeyUp:D,onMouseDown:O,onMouseLeave:k,onMouseUp:A,onTouchEnd:j,onTouchMove:M,onTouchStart:N,tabIndex:P=0,TouchRippleProps:F,touchRippleRef:L,type:R,...z}=r,B=w.useRef(null),V=ee(),H=_(V.ref,L),[U,W]=w.useState(!1);l&&U&&W(!1),w.useImperativeHandle(i,()=>({focusVisible:()=>{W(!0),B.current.focus()}}),[]);let K=V.shouldMount&&!u&&!l;w.useEffect(()=>{U&&f&&!u&&V.pulsate()},[u,f,U,V]);let q=Y(V,`start`,O,d),J=Y(V,`stop`,y,d),re=Y(V,`stop`,b,d),ie=Y(V,`stop`,A,d),ae=Y(V,`stop`,e=>{U&&e.preventDefault(),k&&k(e)},d),oe=Y(V,`start`,N,d),se=Y(V,`stop`,j,d),ce=Y(V,`stop`,M,d),le=Y(V,`stop`,e=>{S(e.target)||W(!1),g&&g(e)},!1),ue=C(e=>{B.current||=e.currentTarget,S(e.target)&&(W(!0),T&&T(e)),x&&x(e)}),X=()=>{let e=B.current;return c&&c!==`button`&&!(e.tagName===`A`&&e.href)},de=C(e=>{f&&!e.repeat&&U&&e.key===` `&&V.stop(e,()=>{V.start(e)}),e.target===e.currentTarget&&X()&&e.key===` `&&e.preventDefault(),E&&E(e),e.target===e.currentTarget&&X()&&e.key===`Enter`&&!l&&(e.preventDefault(),v&&v(e))}),fe=C(e=>{f&&e.key===` `&&U&&!e.defaultPrevented&&V.stop(e,()=>{V.pulsate(e)}),D&&D(e),v&&e.target===e.currentTarget&&X()&&e.key===` `&&!e.defaultPrevented&&v(e)}),Z=c;Z===`button`&&(z.href||z.to)&&(Z=h);let Q={};if(Z===`button`){let e=!!z.formAction;Q.type=R===void 0&&!e?`button`:R,Q.disabled=l}else !z.href&&!z.to&&(Q.role=`button`),l&&(Q[`aria-disabled`]=l);let pe=_(t,B),$={...r,centerRipple:a,component:c,disabled:l,disableRipple:u,disableTouchRipple:d,focusRipple:f,tabIndex:P,focusVisible:U},me=te($);return(0,I.jsxs)(ne,{as:Z,className:n(me.root,s),ownerState:$,onBlur:le,onClick:v,onContextMenu:J,onFocus:ue,onKeyDown:de,onKeyUp:fe,onMouseDown:q,onMouseLeave:ae,onMouseUp:ie,onDragLeave:re,onTouchEnd:se,onTouchMove:ce,onTouchStart:oe,ref:pe,tabIndex:l?-1:P,type:R,...Q,...z,children:[o,K?(0,I.jsx)(G,{ref:H,center:a,...F}):null]})});function Y(e,t,n,r=!1){return C(i=>(n&&n(i),r||e[t](i),!0))}export{x as i,C as n,S as r,J as t};