import{twMerge as X}from"tailwind-merge";import{twMerge as Le}from"tailwind-merge";import{jsx as j,jsxs as Me}from"react/jsx-runtime";function Y({className:e,...t}){return Me("svg",{className:Le("-my-[0.125em] h-[1.25em] w-[1.25em] animate-spin",e),xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",...t,children:[j("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),j("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})}import{jsx as J,jsxs as Ne}from"react/jsx-runtime";var Be=({variant:e="primary"}={})=>X("self-center text-sm font-medium px-4 py-2 border border-transparent inline-flex justify-center",{primary:"text-white bg-orange-500 hover:bg-orange-400 active:bg-orange-600 disabled:bg-neutral-400 disabled:text-neutral-200",secondary:"text-white disabled:text-neutral-400 bg-neutral-600 hover:bg-neutral-500 active:bg-neutral-700 border-white/20",tertiary:"text-white disabled:text-neutral-400 border-white/20 hover:bg-white/10 active:bg-black/10"}[e]),l=({pending:e,variant:t,type:o,className:r,children:i,disabled:n,...a})=>Ne("button",{type:o||"button",className:X(Be({variant:t}),r),disabled:n||e,...a,children:[i,e?J("span",{className:"self-center ml-2 -mr-1",children:J(Y,{})}):null]});import{useConnectModal as Ge}from"@rainbow-me/rainbowkit";import{useCallback as B,useMemo as Ie}from"react";import{useStore as Oe}from"zustand";import{createStore as He}from"zustand/vanilla";var k=He(()=>({open:!1}));function N(){let{openConnectModal:e,connectModalOpen:t}=Ge(),o=!e||t,r=Oe(k,s=>s.open),i=B(()=>{k.setState({open:!0})},[]),n=B(()=>{k.setState({open:!1})},[]),a=B(s=>{k.setState({open:s})},[]);return Ie(()=>({openConnectModal:e,connectPending:o,loginDialogOpen:r,openLoginDialog:i,closeLoginDialog:n,toggleLoginDialog:a}),[n,o,r,e,i,a])}import{useMemo as ko}from"react";import{assertExhaustive as Do}from"@latticexyz/common/utils";import*as te from"@radix-ui/react-dialog";import{keccak256 as We}from"viem";import{useSignMessage as Qe}from"wagmi";import{useLocalStorage as ze}from"usehooks-ts";import{privateKeyToAccount as Ee}from"viem/accounts";import{useMemo as qe}from"react";var Ue="mud:appSigner:privateKey";function m(){let[e,t]=ze(Ue,void 0);return qe(()=>[e?Ee(e):void 0,t],[e,t])}import*as f from"@radix-ui/react-dialog";import{twMerge as Fe}from"tailwind-merge";import{jsx as Ke}from"react/jsx-runtime";function Z({className:e,children:t,...o}){return Ke("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",className:Fe("h-[1em] w-[1em]",e),...o,children:t})}import{jsx as $}from"react/jsx-runtime";function ee(e){return $(Z,{...e,children:$("path",{d:"M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"})})}import{jsx as D,jsxs as G}from"react/jsx-runtime";function g({title:e,description:t,children:o}){return G(f.Content,{className:"flex w-[28rem] flex-col gap-6 bg-neutral-800 text-neutral-400 border border-white/20 p-6 outline-none",children:[G("div",{className:"flex flex-col gap-3",children:[G("div",{className:"flex items-start gap-4",children:[D(f.Title,{className:"flex-grow font-mono text-xl uppercase text-white",children:e}),D(f.Close,{className:"-m-2 flex-shrink-0 p-2 text-xl text-white/40 transition hover:text-white",title:"Close",children:D(ee,{})})]}),t?D(f.Description,{className:"text-sm text-white",children:t}):null]}),o]})}import{jsx as P,jsxs as Ve}from"react/jsx-runtime";function oe(){let[,e]=m(),{signMessageAsync:t,isPending:o}=Qe();return P(g,{title:"Generate app signer",description:"TODO",children:Ve("div",{className:"flex gap-3 justify-end",children:[P(te.Close,{asChild:!0,children:P(l,{variant:"tertiary",children:"Cancel"})}),P(l,{variant:"secondary",pending:o,onClick:async()=>{let r=await t({message:"Create app-signer"});e(We(r))},children:"Generate signer"})]})})}import{parseEther as ct}from"viem";import{useAccount as lt,useConfig as dt,useWriteContract as pt}from"wagmi";import{createContext as _e,useContext as re}from"react";import{jsx as Ye}from"react/jsx-runtime";var I=_e(null);function je({config:e,children:t}){if(re(I))throw new Error("`MUDLoginProvider` can only be used once.");return Ye(I.Provider,{value:e,children:t})}function d(){let e=re(I);if(!e)throw new Error("`useLoginConfig` be used within a `MUDLoginProvider`.");return e}import ut from"@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";import{useAccount as rt,usePublicClient as nt}from"wagmi";import{useQuery as it}from"@tanstack/react-query";import{decodeValueArgs as Xe,getKeySchema as Ze,getSchemaTypes as $e,getValueSchema as et}from"@latticexyz/protocol-parser/internal";import{readContract as tt}from"viem/actions";import ot from"@latticexyz/store/out/IStoreRead.sol/IStoreRead.abi.json";import{encodeAbiParameters as Je}from"viem";function T(e,t){return Object.keys(e).map(o=>Je([e[o]],[t[o]]))}async function h(e,{storeAddress:t,table:o,key:r,blockTag:i}){let n=T(Ze(o),r),[a,s,c]=await tt(e,{address:t,abi:ot,functionName:"getRecord",args:[o.tableId,n],blockTag:i});return{...r,...Xe($e(et(o)),{staticData:a,encodedLengths:s,dynamicData:c})}}import at from"@latticexyz/gas-tank/mud.config";function O(e){return["mud:getGasTankBalance",e]}async function st({publicClient:e,worldAddress:t,userAccountAddress:o}){return(await h(e,{storeAddress:t,table:at.tables.UserBalances,key:{userAccount:o},blockTag:"pending"})).balance}function ne(){let{chainId:e,gasTankAddress:t}=d(),o=nt({chainId:e}),i=rt().address,n=O({chainId:e,gasTankAddress:t,userAccountAddress:i});return it(o&&t&&i?{queryKey:n,queryFn:()=>st({publicClient:o,worldAddress:t,userAccountAddress:i})}:{queryKey:n,enabled:!1}).data}import{waitForTransactionReceipt as mt}from"wagmi/actions";import{useQueryClient as gt}from"@tanstack/react-query";import{jsx as R,jsxs as ie}from"react/jsx-runtime";function ae(){let e=gt(),t=dt(),{chainId:o,gasTankAddress:r}=d(),n=lt().address,{writeContractAsync:a,isPending:s,error:c}=pt({mutation:{onSuccess:async p=>{(await mt(t,{hash:p})).status==="success"&&e.invalidateQueries({queryKey:O({chainId:o,gasTankAddress:r,userAccountAddress:n})})}}});return ie(g,{title:"Fund Redstone balance",description:"TODO",children:[c?R("div",{children:String(c)}):null,ie("div",{className:"flex flex-col gap-2",children:[R(l,{variant:"secondary",pending:!n||s,onClick:async()=>{n&&await a({chainId:o,address:r,abi:ut,functionName:"depositTo",args:[n],value:ct("0.01")})},children:"Deposit to gas tank"}),R(l,{variant:"secondary",disabled:!0,children:"Relay.link"}),R(l,{variant:"secondary",disabled:!0,children:"Redstone ETH"})]})]})}import*as xe from"@radix-ui/react-dialog";import{useMemo as Pt}from"react";import{useAccount as Tt,usePublicClient as Rt}from"wagmi";import{http as fe,maxUint256 as he,toHex as be}from"viem";import{callFrom as Lt}from"@latticexyz/world/internal";import{createSmartAccountClient as Mt}from"permissionless";import{createPimlicoBundlerClient as Bt}from"permissionless/clients/pimlico";import{call as Nt,getTransactionCount as Gt}from"viem/actions";import{signerToSimpleSmartAccount as bt}from"permissionless/accounts";import{useQuery as wt}from"@tanstack/react-query";import{resourceToHex as ft}from"@latticexyz/common";import{ENTRYPOINT_ADDRESS_V07 as ht}from"permissionless";var y=ht,se=0n,H="0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",ce=["connectedWallet","connectedChain","appSigner","gasAllowance","gasSpender","accountDelegation"],L=ft({type:"system",namespace:"",name:"unlimited"});async function yt({publicClient:e,appSignerAccount:t}){return await bt(e,{entryPoint:y,factoryAddress:H,signer:t})}function x({publicClient:e,appSignerAccount:t}){let o=["mud:appAccount",e?.chain.id,y,H,t?.address];return wt(e&&t?{queryKey:o,queryFn:()=>yt({publicClient:e,appSignerAccount:t}),staleTime:1/0}:{queryKey:o,enabled:!1})}import ue from"@latticexyz/gas-tank/mud.config";import{concatHex as xt,hexToBigInt as le,keccak256 as de,toBytes as At,toHex as Ct}from"viem";var vt=le(de(At("mud.store")));function pe(e,t){return Ct(vt^le(de(xt([e,...t]))))}import{getKeySchema as St}from"@latticexyz/protocol-parser/internal";function me(e){return pe(ue.tables.UserBalances.tableId,T(St(ue.tables.UserBalances),{userAccount:e}))}import{encodeAbiParameters as kt,keccak256 as Dt}from"viem";function ge(e){return Dt(kt([{type:"address"},{type:"uint256"}],[e,se]))}function v(){let[e]=m(),{chainId:t,worldAddress:o,gasTankAddress:r}=d(),{address:i}=Tt(),n=Rt({chainId:t}),{data:a}=x({publicClient:n,appSignerAccount:e});return Pt(()=>{if(!e||!i||!n||!a)return;let s=Bt({chain:n.chain,transport:fe("http://127.0.0.1:4337"),entryPoint:y});return Mt({chain:n.chain,account:a,bundlerTransport:fe("http://127.0.0.1:4337"),middleware:{sponsorUserOperation:async({userOperation:p})=>{let u=await s.estimateUserOperationGas({userOperation:{...p,paymaster:r,paymasterData:"0x"}},{[r]:{stateDiff:{[me(i)]:be(he)}},[y]:{stateDiff:{[ge(r)]:be(he)}}});return{paymasterData:"0x",paymaster:r,...u}},gasPrice:async()=>(await s.getUserOperationGasPrice()).fast}}).extend(()=>({getTransactionCount:p=>(console.log("getTransactionCount, ",p),Gt(n,p)),call:p=>Nt(n,p)})).extend(Lt({worldAddress:o,delegatorAddress:i,publicClient:n}))},[e,i,n,a,o,r])}import{usePublicClient as Qt,useWalletClient as Vt}from"wagmi";import{encodeFunctionData as _t}from"viem";import{waitForTransactionReceipt as jt}from"viem/actions";import Yt from"@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";import{resourceToHex as Jt}from"@latticexyz/common";import{useMutation as Xt,useQueryClient as Zt}from"@tanstack/react-query";import{writeContract as Ht}from"viem/actions";import{signTypedData as It}from"viem/actions";import{callWithSignatureTypes as Ot}from"@latticexyz/world/internal";async function we({userAccountClient:e,worldAddress:t,systemId:o,callData:r,nonce:i}){return await It(e,{account:e.account,domain:{chainId:e.chain.id,verifyingContract:t},types:Ot,primaryType:"Call",message:{signer:e.account.address,systemId:o,callData:r,nonce:i}})}import zt from"@latticexyz/world-modules/internal/mud.config";import Et from"@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";async function M({userAccountClient:e,worldAddress:t,systemId:o,callData:r,publicClient:i,appAccountClient:n,nonce:a}){let s=a??(await h(i,{storeAddress:t,table:zt.tables.CallWithSignatureNonces,key:{signer:e.account.address},blockTag:"pending"})).nonce,c=await we({worldAddress:t,userAccountClient:e,systemId:o,callData:r,nonce:s});return Ht(n,{address:t,abi:Et,functionName:"callWithSignature",args:[e.account.address,o,r,c]})}import{useAccount as qt,usePublicClient as Ut}from"wagmi";import{useQuery as Ft}from"@tanstack/react-query";import Kt from"@latticexyz/world/mud.config";function z(e){return["mud:hasDelegation",e]}async function Wt({publicClient:e,worldAddress:t,userAccountAddress:o,appAccountAddress:r}){return(await h(e,{storeAddress:t,table:Kt.tables.world__UserDelegationControl,key:{delegator:o,delegatee:r},blockTag:"pending"})).delegationControlId===L}function ye(){let{chainId:e,worldAddress:t}=d(),o=Ut({chainId:e}),r=qt(),[i]=m(),n=x({publicClient:o,appSignerAccount:i}),a=r.address,s=n.data?.address,c=z({chainId:e,worldAddress:t,userAccountAddress:a,appAccountAddress:s});return Ft(o&&t&&a&&s?{queryKey:c,queryFn:()=>Wt({publicClient:o,worldAddress:t,userAccountAddress:a,appAccountAddress:s}),staleTime:1e3*60*5}:{queryKey:c,enabled:!1}).data}import{Fragment as $t,jsx as q,jsxs as E}from"react/jsx-runtime";function Ae(){let e=Zt(),{chainId:t,worldAddress:o}=d(),r=Qt({chainId:t}),{data:i}=Vt({chainId:t}),n=v(),{mutate:a,isPending:s,error:c}=Xt({mutationFn:async()=>{if(!r)throw new Error("Public client not ready. Not connected?");if(!i)throw new Error("Wallet client not ready. Not connected?");if(!n)throw new Error("App account client not ready.");console.log("registerDelegation");let p=await M({worldAddress:o,systemId:Jt({type:"system",namespace:"",name:"Registration"}),callData:_t({abi:Yt,functionName:"registerDelegation",args:[n.account.address,L,"0x"]}),publicClient:r,userAccountClient:i,appAccountClient:n});console.log("registerDelegation tx",p);let u=await jt(r,{hash:p});if(console.log("registerDelegation receipt",u),u.status==="reverted")throw console.error("Failed to register delegation.",u),new Error("Failed to register delegation.");e.invalidateQueries({queryKey:z({chainId:t,worldAddress:o,userAccountAddress:i.account.address,appAccountAddress:n.account.address})})}});return E(g,{title:"Delegation",description:"Delegation description",children:[c?E($t,{children:["Error: ",String(c)]}):null,E("div",{className:"flex gap-3 justify-end",children:[q(xe.Close,{asChild:!0,children:q(l,{variant:"tertiary",children:"Cancel"})}),q(l,{variant:"secondary",pending:s,onClick:()=>a(),children:"Set up delegation"})]})]})}import*as ve from"@radix-ui/react-dialog";import{usePublicClient as io,useWalletClient as ao}from"wagmi";import{encodeFunctionData as so}from"viem";import{waitForTransactionReceipt as co}from"viem/actions";import{resourceToHex as lo}from"@latticexyz/common";import po from"@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";import{useAccount as eo,usePublicClient as to}from"wagmi";import{useQuery as oo}from"@tanstack/react-query";import ro from"@latticexyz/gas-tank/mud.config";function U(e){return["mud:isGasSpender",e]}async function no({publicClient:e,gasTankAddress:t,userAccountAddress:o,appAccountAddress:r}){return(await h(e,{storeAddress:t,table:ro.tables.Spender,key:{spender:r},blockTag:"pending"})).userAccount===o}function Ce(){let{chainId:e,gasTankAddress:t}=d(),o=to({chainId:e}),i=eo().address,[n]=m(),s=x({publicClient:o,appSignerAccount:n}).data?.address,c=U({chainId:e,gasTankAddress:t,userAccountAddress:i,appAccountAddress:s});return oo(o&&t&&i&&s?{queryKey:c,queryFn:()=>no({publicClient:o,gasTankAddress:t,userAccountAddress:i,appAccountAddress:s})}:{queryKey:c,enabled:!1}).data}import{useMutation as uo,useQueryClient as mo}from"@tanstack/react-query";import{Fragment as go,jsx as K,jsxs as F}from"react/jsx-runtime";function Se(){let e=mo(),{chainId:t,gasTankAddress:o}=d(),r=io({chainId:t}),{data:i}=ao({chainId:t}),n=v(),{mutate:a,isPending:s,error:c}=uo({mutationFn:async()=>{if(!r)throw new Error("Public client not ready. Not connected?");if(!i)throw new Error("Wallet client not ready. Not connected?");if(!n)throw new Error("App account client not ready.");console.log("registerSpender");let p=await M({worldAddress:o,systemId:lo({type:"system",namespace:"",name:"PaymasterSystem"}),callData:so({abi:po,functionName:"registerSpender",args:[n.account.address]}),publicClient:r,userAccountClient:i,appAccountClient:n});console.log("registerSpender tx",p);let u=await co(r,{hash:p});if(console.log("registerSpender receipt",u),u.status==="reverted")throw console.error("Failed to register spender.",u),new Error("Failed to register spender.");e.invalidateQueries({queryKey:U({chainId:t,gasTankAddress:o,userAccountAddress:i.account.address,appAccountAddress:n.account.address})})}});return F(g,{title:"Gas spender",description:"TODO",children:[c?F(go,{children:["Error: ",String(c)]}):null,F("div",{className:"flex gap-3 justify-end",children:[K(ve.Close,{asChild:!0,children:K(l,{variant:"tertiary",children:"Cancel"})}),K(l,{variant:"secondary",pending:s,onClick:()=>a(),children:"Set up spender"})]})]})}import*as ke from"@radix-ui/react-dialog";import{useSwitchChain as fo}from"wagmi";import{Fragment as ho,jsx as Q,jsxs as W}from"react/jsx-runtime";function De(){let{chainId:e}=d(),{switchChain:t,isPending:o,error:r}=fo();return W(g,{title:"Switch chain",description:"Switch chain to login",children:[r?W(ho,{children:["Error: ",String(r)]}):null,W("div",{className:"flex gap-3 justify-end",children:[Q(ke.Close,{children:Q(l,{variant:"tertiary",children:"Cancel"})}),Q(l,{variant:"secondary",pending:o,onClick:()=>t({chainId:e}),children:"Switch chain"})]})]})}import*as C from"@radix-ui/react-dialog";import{useEffect as wo,useRef as yo,useState as xo}from"react";import Ao from"react-dom";var Pe=`/*
! tailwindcss v3.4.3 | MIT License | https://tailwindcss.com
*//*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box; /* 1 */
  border-width: 0; /* 2 */
  border-style: solid; /* 2 */
  border-color: #e5e7eb; /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */ /* 3 */
  tab-size: 4; /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; /* 4 */
  font-feature-settings: normal; /* 5 */
  font-variation-settings: normal; /* 6 */
  -webkit-tap-highlight-color: transparent; /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0; /* 1 */
  line-height: inherit; /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0; /* 1 */
  color: inherit; /* 2 */
  border-top-width: 1px; /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; /* 1 */
  font-feature-settings: normal; /* 2 */
  font-variation-settings: normal; /* 3 */
  font-size: 1em; /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0; /* 1 */
  border-color: inherit; /* 2 */
  border-collapse: collapse; /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-feature-settings: inherit; /* 1 */
  font-variation-settings: inherit; /* 1 */
  font-size: 100%; /* 1 */
  font-weight: inherit; /* 1 */
  line-height: inherit; /* 1 */
  letter-spacing: inherit; /* 1 */
  color: inherit; /* 1 */
  margin: 0; /* 2 */
  padding: 0; /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/
dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::placeholder,
textarea::placeholder {
  opacity: 1; /* 1 */
  color: #9ca3af; /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/
:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */
[hidden] {
  display: none;
}

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

.\\!container {
  width: 100% !important;
}

.container {
  width: 100%;
}

@media (min-width: 640px) {

  .\\!container {
    max-width: 640px !important;
  }

  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {

  .\\!container {
    max-width: 768px !important;
  }

  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {

  .\\!container {
    max-width: 1024px !important;
  }

  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {

  .\\!container {
    max-width: 1280px !important;
  }

  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {

  .\\!container {
    max-width: 1536px !important;
  }

  .container {
    max-width: 1536px;
  }
}

.fixed {
  position: fixed;
}

.inset-0 {
  inset: 0px;
}

.-m-2 {
  margin: -0.5rem;
}

.-my-\\[0\\.125em\\] {
  margin-top: -0.125em;
  margin-bottom: -0.125em;
}

.-mr-1 {
  margin-right: -0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.table {
  display: table;
}

.grid {
  display: grid;
}

.contents {
  display: contents;
}

.h-\\[1\\.25em\\] {
  height: 1.25em;
}

.h-\\[1em\\] {
  height: 1em;
}

.w-48 {
  width: 12rem;
}

.w-\\[1\\.25em\\] {
  width: 1.25em;
}

.w-\\[1em\\] {
  width: 1em;
}

.w-\\[28rem\\] {
  width: 28rem;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

@keyframes spin {

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.flex-col {
  flex-direction: column;
}

.place-items-center {
  place-items: center;
}

.items-start {
  align-items: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.self-center {
  align-self: center;
}

.overflow-y-auto {
  overflow-y: auto;
}

.border {
  border-width: 1px;
}

.border-transparent {
  border-color: transparent;
}

.border-white\\/20 {
  border-color: rgb(255 255 255 / 0.2);
}

.bg-neutral-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(82 82 82 / var(--tw-bg-opacity));
}

.bg-neutral-800 {
  --tw-bg-opacity: 1;
  background-color: rgb(38 38 38 / var(--tw-bg-opacity));
}

.bg-neutral-950\\/60 {
  background-color: rgb(10 10 10 / 0.6);
}

.bg-orange-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(249 115 22 / var(--tw-bg-opacity));
}

.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.uppercase {
  text-transform: uppercase;
}

.text-neutral-400 {
  --tw-text-opacity: 1;
  color: rgb(163 163 163 / var(--tw-text-opacity));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.text-white\\/40 {
  color: rgb(255 255 255 / 0.4);
}

.opacity-25 {
  opacity: 0.25;
}

.opacity-75 {
  opacity: 0.75;
}

.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.outline {
  outline-style: solid;
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@keyframes enter {

  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {

  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}

.animate-in {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}

.fade-in {
  --tw-enter-opacity: 0;
}

.hover\\:bg-neutral-500:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(115 115 115 / var(--tw-bg-opacity));
}

.hover\\:bg-orange-400:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(251 146 60 / var(--tw-bg-opacity));
}

.hover\\:bg-white\\/10:hover {
  background-color: rgb(255 255 255 / 0.1);
}

.hover\\:text-white:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.active\\:bg-black\\/10:active {
  background-color: rgb(0 0 0 / 0.1);
}

.active\\:bg-neutral-700:active {
  --tw-bg-opacity: 1;
  background-color: rgb(64 64 64 / var(--tw-bg-opacity));
}

.active\\:bg-orange-600:active {
  --tw-bg-opacity: 1;
  background-color: rgb(234 88 12 / var(--tw-bg-opacity));
}

.disabled\\:bg-neutral-400:disabled {
  --tw-bg-opacity: 1;
  background-color: rgb(163 163 163 / var(--tw-bg-opacity));
}

.disabled\\:text-neutral-200:disabled {
  --tw-text-opacity: 1;
  color: rgb(229 229 229 / var(--tw-text-opacity));
}

.disabled\\:text-neutral-400:disabled {
  --tw-text-opacity: 1;
  color: rgb(163 163 163 / var(--tw-text-opacity));
}
`;import{jsx as Co}from"react/jsx-runtime";function A({children:e}){let t=yo(null),[o,r]=xo(null);return wo(()=>{let i=t.current;if(!i)return;let n=i.attachShadow({mode:"open",delegatesFocus:!0});r(n);let a=new CSSStyleSheet;a.replaceSync(Pe),n.adoptedStyleSheets=[a]},[]),Co("span",{ref:t,style:{display:"unset",outline:"none"},children:o?Ao.createPortal(e,o):null})}import{Fragment as vo,jsx as S,jsxs as So}from"react/jsx-runtime";function Te({open:e,onOpenChange:t,trigger:o,children:r}){return So(C.Root,{open:e,onOpenChange:t,children:[o?S(C.Trigger,{asChild:!0,children:o}):null,S(C.Portal,{children:S(vo,{children:S(A,{children:S("div",{className:"bg-neutral-950/60 animate-in fade-in fixed inset-0 grid place-items-center overflow-y-auto p-4",children:r})})})})]})}import{Fragment as Po,jsx as b}from"react/jsx-runtime";function Re({requirement:e,...t}){let o=ko(()=>{switch(e){case"connectedWallet":return b(Po,{children:"Connect wallet"});case"connectedChain":return b(De,{});case"appSigner":return b(oe,{});case"gasAllowance":return b(ae,{});case"gasSpender":return b(Se,{});case"accountDelegation":return b(Ae,{});default:return Do(e)}},[e]);return b(Te,{...t,children:o})}import{useAccount as To}from"wagmi";import{useMemo as Ro}from"react";function V(){let{chainId:e}=d(),t=To(),[o]=m(),r=ne(),i=Ce(),n=ye();return Ro(()=>{let a={connectedWallet:()=>t.status==="connected",connectedChain:()=>t.chainId===e,appSigner:()=>o!=null,gasAllowance:()=>r!=null&&r>0n,gasSpender:()=>i===!0,accountDelegation:()=>n===!0},s=ce.filter(c=>!a[c]());return{requirement:s.at(0)??null,requirements:s}},[o,e,r,n,i,t.chainId,t.status])}import{Fragment as Mo,jsx as w,jsxs as Bo}from"react/jsx-runtime";var _="w-48";function Lo(){let{requirement:e}=V(),{openConnectModal:t,connectPending:o,openLoginDialog:r,toggleLoginDialog:i,loginDialogOpen:n}=N();return e==="connectedWallet"?w(A,{children:w(l,{className:_,pending:o,onClick:()=>{t?.(),r()},children:"Connect wallet"})}):e!=null?Bo(Mo,{children:[w(A,{children:w(l,{className:_,onClick:r,children:"Log in"})}),w(Re,{requirement:e,open:n,onOpenChange:i})]}):w(A,{children:w(l,{className:_,disabled:!0,children:"All good!"})})}export{Lo as LoginButton,je as MUDLoginProvider,v as useAppAccountClient,N as useLoginDialog,V as useLoginRequirements};
//# sourceMappingURL=index.js.map