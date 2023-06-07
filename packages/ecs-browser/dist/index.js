import{useState as ue}from"react";import{setup as Ce,styled as d}from"goober";import fe from"react";import{createElement as he}from"react";Ce(he);var v=d("input",fe.forwardRef)`
  background-color: #383c4a;
  color: #8c91a0;
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
  padding-left: 8px;
  margin: 8px 0;

  &:focus {
    outline: none;
    border: 1px #8c91a0 solid;
  }
  ::selection {
    color: white;
    background: rgba(70, 89, 182, 0.9);
  }
`,h=d("button")`
  background-color: ${({active:t})=>t==="true"?"#8c91a0":"#383c4a"};
  color: ${({active:t})=>t==="true"?"#383c4a":"#8c91a0"};
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;

  &:hover {
    background-color: #8c91a0;
    color: #383c4a;
  }
`,O=d("select")`
  width: 180px;
  background-color: #383c4a;
  color: #8c91a0;
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
`,Q=d("form")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`,D=d("div")`
  margin: 8px auto;
`,L=d("div")`
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`,R=d("div")`
  border-bottom: 1px #8c91a0 solid;
  padding: 8px;
`,$=d("div")`
  overflow: auto;
  background-color: rgba(27, 28, 32, 1);
  color: #8c91a0;
  height: 100%;
  pointer-events: all;
`,I=d("label")`
  cursor: ew-resize;
  user-select: none;
  color: #8c91a0;
`,N=d("p")`
  padding: 8px;
  font-size: 14px;
`,W=d("div")`
  height: ${({opened:t})=>t==="true"?"auto":"0px"};
  overflow: ${({opened:t})=>t==="true"?"initial":"hidden"};
`,B=d("div")`
  .shiki {
    background-color: #282a36;

    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;

    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
    padding: 1em;
    margin: 0.5em 0px;
    overflow: auto;
    border-radius: 0.3em;
    overflow: auto;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    text-shadow: rgba(0, 0, 0, 0.3) 0px 1px;
  }
`;import{useEffect as Oe,useState as ee}from"react";import{setComponent as Qe,getEntityComponents as De}from"@latticexyz/recs";import{removeComponent as He}from"@latticexyz/recs";import{useState as we,useEffect as Se,useCallback as Fe,useMemo as Te}from"react";import{getComponentValueStrict as z,Type as Be,updateComponent as _}from"@latticexyz/recs";import{isArrayType as ke,isEntityType as Me,isNumberType as k,isOptionalType as Ve}from"@latticexyz/recs";import U from"lodash/startCase";import{useMemo as Ee}from"react";import{useCallback as ve,useEffect as be,useState as j}from"react";import{jsx as xe}from"react/jsx-runtime";function X({label:t,value:o,setValue:i,persistValue:r}){let s=Ee(()=>parseInt(o??"0"),[o]),[p,l]=j(s),[a,m]=j(0),u=ve(n=>{m(n.clientX),l(s)},[s]);return be(()=>{function n(C){if(a){let f=Math.round((C.clientX-a)/25)+p;i(f.toString())}}let g=C=>{a&&(m(0),r(C,o?.toString()||null))};return document.addEventListener("mousemove",n),document.addEventListener("mouseup",g),()=>{document.removeEventListener("mousemove",n),document.removeEventListener("mouseup",g)}},[a,i,p,o]),xe(I,{onMouseDown:u,children:t})}function b(t){return t.metadata?.contractId!==void 0}import{jsx as x,jsxs as M}from"react/jsx-runtime";var G=({entity:t,component:o,componentValue:i,valueProp:r,layers:s,setContractComponentValue:p})=>{let[l,a]=we(i[r]?.toString());Se(()=>{let n=i[r];a(n)},[i,r]);let m=Te(()=>{let n=o.schema[r];return k(n)?"number":Me(n)?"select":"text"},[o,r]),u=Fe((n,g)=>{n.preventDefault();let C=o.schema[r];if(g==null||g===""){if(Ve(C)){_(o,t,{[r]:void 0});return}let T=z(o,t);a(T[r]);return}let f;if(k(C)?f=parseInt(g):ke(C)?f=g.split(","):C===Be.Boolean?f=g==="true":f=g,b(o)&&p){let T=z(o,t);p(t,o,{...T,[r]:f})}else _(o,t,{[r]:f})},[t,o,r,s,m]);return M(Q,{onSubmit:n=>u(n,l),children:[k(o.schema[r])?x(X,{value:l,setValue:a,persistValue:u,label:`${U(r)}:`}):M("label",{style:{cursor:"pointer"},htmlFor:`value-${r}`,children:[U(r),":"]}),m==="select"?M(O,{value:l??"",onChange:n=>{a(n.target.value),u(n,n.target.value)},children:[x("option",{value:"",children:"None"}),[...Object.values(s)[0].world.getEntities()].map(n=>x("option",{value:n,children:n},n))]}):x(v,{id:`value-${r}`,name:`value-${r}`,type:m,value:l??"",onFocus:n=>n.target.select(),onChange:n=>{a(n.target.value)},onBlur:n=>u(n,l)})]})};import{jsx as J}from"react/jsx-runtime";var K=({entity:t,component:o,componentValue:i,layers:r,setContractComponentValue:s})=>J("div",{children:Object.keys(i).map(p=>J(G,{entity:t,component:o,componentValue:i,valueProp:p,layers:r,setContractComponentValue:s},`value-editor-${p}-${t}`))});import{useComponentValueStream as Ae}from"@latticexyz/std-client";import{jsx as Y,jsxs as Z}from"react/jsx-runtime";var P=({entity:t,component:o,layers:i,setContractComponentValue:r})=>{let s=Ae(o,t);return s?Z(D,{children:[Z(L,{children:[o.id,Y(h,{onClick:()=>{He(o,t),r&&b(o)&&r(t,o,{})},children:"Remove"})]}),Y(K,{entity:t,component:o,componentValue:s,layers:i,setContractComponentValue:r})]}):null};import{observer as Le}from"mobx-react-lite";import{Fragment as te,jsx as E,jsxs as w}from"react/jsx-runtime";var oe=Le(({entityId:t,layers:o,setContractComponentValue:i,devHighlightComponent:r,world:s,clearDevHighlights:p})=>{let[l,a]=ee(!1),[m,u]=ee([]);return Oe(()=>{if(l){let n=De(s,t);u(n)}},[l,s,t,u]),w(R,{onMouseEnter:()=>{p(),Qe(r,t,{value:void 0})},onMouseLeave:()=>p(),children:[w("div",{onClick:()=>a(!l),style:{cursor:"pointer"},children:[w("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-between"},children:[w("h3",{style:{color:"white"},children:["Entity ",t]}),E(h,{onClick:n=>{n.stopPropagation(),navigator.clipboard.writeText(t)},children:"Click to copy Entity ID"})]}),E(h,{onClick:()=>a(!l),children:l?E(te,{children:"\u25BC"}):E(te,{children:"\u25B6"})})]}),E(W,{"aria-hidden":l?"false":"true",opened:String(l),children:[...m.values()].filter(n=>n.id!==r.id).map(n=>E(P,{entity:t,component:n,layers:o,setContractComponentValue:i},`component-editor-${t}-${n.id}`))})]})});import{useState as S,useRef as pe,useCallback as V,useEffect as H}from"react";import{setComponent as je,defineQuery as Xe}from"@latticexyz/recs";import{styled as re}from"goober";var ne=re("form")`
  padding: 8px;
  border-bottom: 2px grey solid;
  margin-bottom: 8px;
  width: 100%;
`,ie=re("div")`
  flex: "row wrap";
  margin-top: "8px";
  height: 200px;
  overflow: auto;
`;import*as ze from"@latticexyz/recs";import _e from"lodash/flatten";import Ue from"lodash/orderBy";import Ge from"lodash/throttle";import{observe as Je}from"mobx";import{Has as Re,removeComponent as $e}from"@latticexyz/recs";import{useQuery as Ie}from"@latticexyz/std-client";import{useCallback as qe,useEffect as Ne,useState as se}from"react";function ae(t){let o=Ie([Re(t)]);return qe(()=>{if(o)for(let i of o)$e(t,i)},[o])}function le(t,o){let[i,r]=se(),[s,p]=se();return Ne(()=>{async function l(){try{let a=await import("shiki");a.setCDN("https://unpkg.com/shiki/");let m=await a.getHighlighter({theme:"dracula-soft",langs:[o]});r(m.codeToHtml(t,{lang:o})),p(m.codeToThemedTokens(t,o))}catch(a){console.error(a)}}l()},[t]),{html:i,tokens:s}}import{Fragment as Ke,jsx as y,jsxs as F}from"react/jsx-runtime";var me=({code:t})=>{let{html:o}=le(t,"js");return o?y(B,{dangerouslySetInnerHTML:{__html:o}}):y(B,{children:y("pre",{className:"shiki"})})},ce=({allEntities,setFilteredEntities,layers,world,devHighlightComponent,clearDevHighlights,setOverflow})=>{let queryInputRef=pe(null),[componentFilters,setComponentFilters]=S([]),[isManuallyEditing,setIsManuallyEditing]=S(!0),[entityQueryText,setEntityQueryText]=S(""),[errorMessage,setErrorMessage]=S(""),allComponents=_e(Object.values(layers).map(t=>Object.values(t.components))),resetFilteredEntities=V(()=>{setFilteredEntities([]),setComponentFilters([]),setErrorMessage("")},[setFilteredEntities,setErrorMessage,allEntities]);H(()=>{entityQueryText||resetFilteredEntities()},[setFilteredEntities,resetFilteredEntities,allEntities,entityQueryText]),H(()=>{if(isManuallyEditing)return;let o=`[${componentFilters.map(i=>`Has(${i.id})`).join(",")}]`;setEntityQueryText(o)},[componentFilters,isManuallyEditing]);let editQuery=V(t=>{setIsManuallyEditing(!0),setEntityQueryText(t),setComponentFilters([])},[]),cancelObserver=pe(()=>{});H(()=>()=>{cancelObserver.current&&cancelObserver.current()},[]);let executeFilter=V(e=>{if(e.preventDefault(),setErrorMessage(""),!entityQueryText){resetFilteredEntities();return}let q={...ze},c=Object.values(layers).reduce((t,o)=>{for(let[i,r]of Object.entries(o.components))t[i]=r;return t},{});try{let assignQueryVars=Object.keys(q).map(t=>`const ${t} = q["${t}"]; `).join(""),assignComponentVars=Object.keys(c).map(t=>`const ${t} = c["${t}"]; `).join(""),evalString=`
        (() => {
          ${assignQueryVars}
          ${assignComponentVars}
          return (${entityQueryText});
        })()
        `,queryArray=eval(evalString);if(!queryArray||queryArray.length===0||!Array.isArray(queryArray))throw resetFilteredEntities(),new Error("Invalid query");cancelObserver.current();let queryResult=Xe(queryArray,{runOnInit:!0}),subscription=queryResult.update$.subscribe(),selectEntities=Ge(()=>{let t=[...queryResult.matching].slice(0,1e3);setOverflow(queryResult.matching.size-t.length),setFilteredEntities(t),clearDevHighlights(),t.forEach(o=>je(devHighlightComponent,o,{value:255}))},1e3,{leading:!0});selectEntities();let cancelObserve=Je(queryResult.matching,selectEntities);cancelObserver.current=()=>{cancelObserve(),selectEntities.cancel(),subscription?.unsubscribe()}}catch(t){setErrorMessage(t.message),console.error(t)}},[entityQueryText,setEntityQueryText,setFilteredEntities,resetFilteredEntities,setErrorMessage,allEntities]);return F(Ke,{children:[F(ne,{onSubmit:executeFilter,children:[y(me,{code:entityQueryText}),errorMessage&&y(me,{code:`Error: ${errorMessage}`}),y("label",{style:{cursor:"pointer"},htmlFor:"query-input",children:y("h3",{children:"Filter Entities"})}),y(v,{id:"query-input",ref:queryInputRef,placeholder:"No filter applied",style:{width:"100%",color:"white"},type:"text",value:entityQueryText,onChange:t=>{errorMessage&&setErrorMessage(""),editQuery(t.target.value)},onFocus:t=>t.target.select()})]}),F("div",{style:{padding:"8px",paddingTop:0,borderBottom:"2px grey solid"},children:[y("h3",{children:"Filter by Component"}),y(ie,{style:{margin:"8px auto"},children:Ue(allComponents,t=>t.id).filter(t=>!t.id.includes("-")).map(t=>{let o=componentFilters.includes(t);return F(h,{active:String(o),onClick:()=>{setIsManuallyEditing(!1),queryInputRef.current?.focus(),setComponentFilters(o?i=>i.filter(r=>r!==t):i=>[...i,t])},children:["Has(",t.id,")"]},`filter-toggle-${t.id}`)})})]})]})};import{observer as Ye}from"mobx-react-lite";import{jsx as de,jsxs as ye}from"react/jsx-runtime";var Ze=Ye(({layers:t,setContractComponentValue:o,world:i,devHighlightComponent:r})=>{let[s,p]=ue([]),[l,a]=ue(0),m=ae(r);return ye($,{children:[de(ce,{devHighlightComponent:r,allEntities:[...i.getEntities()],setFilteredEntities:p,layers:t,world:i,clearDevHighlights:m,setOverflow:a}),ye(N,{children:["Showing ",s.length," of ",s.length+l," entities"]}),s.map(u=>de(oe,{world:i,entityId:u,layers:t,setContractComponentValue:o,devHighlightComponent:r,clearDevHighlights:m},`entity-editor-${u}`))]})});import{defineComponent as ge,Type as A}from"@latticexyz/recs";function Pe(t){let o=ge(t,{value:A.OptionalNumber}),i=ge(t,{x:A.OptionalNumber,y:A.OptionalNumber});return{devHighlightComponent:o,hoverHighlightComponent:i}}export{Ze as Browser,Pe as createBrowserDevComponents};
//# sourceMappingURL=index.js.map