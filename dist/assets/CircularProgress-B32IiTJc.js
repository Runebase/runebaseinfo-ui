import{r as e}from"./chunk-DECur_0Z.js";import{$ as t,E as n,F as r,N as i,P as a,Q as o,T as s,Z as c,_ as l,f as u,it as d,m as f,n as p,t as m}from"./createSimplePaletteValueFilter-DbUAm8nL.js";var h=n;function g(e){return a(`MuiCircularProgress`,e)}i(`MuiCircularProgress`,[`root`,`determinate`,`indeterminate`,`colorPrimary`,`colorSecondary`,`svg`,`track`,`circle`,`circleDeterminate`,`circleIndeterminate`,`circleDisableShrink`]);var _=e(d()),v=c(),y=44,b=t`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,x=t`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,S=typeof b==`string`?null:o`
        animation: ${b} 1.4s linear infinite;
      `,C=typeof x==`string`?null:o`
        animation: ${x} 1.4s ease-in-out infinite;
      `,w=e=>{let{classes:t,variant:n,color:r,disableShrink:i}=e;return s({root:[`root`,n,`color${u(r)}`],svg:[`svg`],track:[`track`],circle:[`circle`,`circle${u(n)}`,i&&`circleDisableShrink`]},g,t)},T=l(`span`,{name:`MuiCircularProgress`,slot:`Root`,overridesResolver:(e,t)=>{let{ownerState:n}=e;return[t.root,t[n.variant],t[`color${u(n.color)}`]]}})(p(({theme:e})=>({display:`inline-block`,variants:[{props:{variant:`determinate`},style:{transition:e.transitions.create(`transform`)}},{props:{variant:`indeterminate`},style:S||{animation:`${b} 1.4s linear infinite`}},...Object.entries(e.palette).filter(m()).map(([t])=>({props:{color:t},style:{color:(e.vars||e).palette[t].main}}))]}))),E=l(`svg`,{name:`MuiCircularProgress`,slot:`Svg`})({display:`block`}),D=l(`circle`,{name:`MuiCircularProgress`,slot:`Circle`,overridesResolver:(e,t)=>{let{ownerState:n}=e;return[t.circle,t[`circle${u(n.variant)}`],n.disableShrink&&t.circleDisableShrink]}})(p(({theme:e})=>({stroke:`currentColor`,variants:[{props:{variant:`determinate`},style:{transition:e.transitions.create(`stroke-dashoffset`)}},{props:{variant:`indeterminate`},style:{strokeDasharray:`80px, 200px`,strokeDashoffset:0}},{props:({ownerState:e})=>e.variant===`indeterminate`&&!e.disableShrink,style:C||{animation:`${x} 1.4s ease-in-out infinite`}}]}))),O=l(`circle`,{name:`MuiCircularProgress`,slot:`Track`})(p(({theme:e})=>({stroke:`currentColor`,opacity:(e.vars||e).palette.action.activatedOpacity}))),k=_.forwardRef(function(e,t){let n=f({props:e,name:`MuiCircularProgress`}),{className:i,color:a=`primary`,disableShrink:o=!1,enableTrackSlot:s=!1,size:c=40,style:l,thickness:u=3.6,value:d=0,variant:p=`indeterminate`,...m}=n,h={...n,color:a,disableShrink:o,size:c,thickness:u,value:d,variant:p,enableTrackSlot:s},g=w(h),_={},b={},x={};if(p===`determinate`){let e=2*Math.PI*((y-u)/2);_.strokeDasharray=e.toFixed(3),x[`aria-valuenow`]=Math.round(d),_.strokeDashoffset=`${((100-d)/100*e).toFixed(3)}px`,b.transform=`rotate(-90deg)`}return(0,v.jsx)(T,{className:r(g.root,i),style:{width:c,height:c,...b,...l},ownerState:h,ref:t,role:`progressbar`,...x,...m,children:(0,v.jsxs)(E,{className:g.svg,ownerState:h,viewBox:`${y/2} ${y/2} ${y} ${y}`,children:[s?(0,v.jsx)(O,{className:g.track,ownerState:h,cx:y,cy:y,r:(y-u)/2,fill:`none`,strokeWidth:u,"aria-hidden":`true`}):null,(0,v.jsx)(D,{className:g.circle,style:_,ownerState:h,cx:y,cy:y,r:(y-u)/2,fill:`none`,strokeWidth:u})]})})});export{h as n,k as t};