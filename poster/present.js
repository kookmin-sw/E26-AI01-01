(()=>{"use strict";
const W=1199,H=1312;
const zones=[
 {name:"전체 보기",box:[0,0,1199,1312]},
 {name:"01 제목과 미래 비전",box:[0,0,1199,320]},
 {name:"02 문제·사용자·2050년 변화",box:[0,317,1199,236]},
 {name:"03 서비스 흐름·핵심 기능",box:[0,545,1199,283]},
 {name:"04 핵심 기술·미래의 일상",box:[0,827,1199,235]},
 {name:"05 실현 가능성·참고자료",box:[0,1058,1199,254]}
];
const viewport=document.getElementById("viewport"),canvas=document.getElementById("canvas"),poster=document.getElementById("poster");
canvas.style.width=W+"px";canvas.style.height=H+"px";
const buttons=[...document.querySelectorAll("[data-section]")],position=document.getElementById("position");
let index=0,scale=1,tx=0,ty=0,drag=null;
function render(immediate=false){canvas.style.transition=immediate?"none":"";canvas.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;}
function fitBox(box,immediate=false){const [x,y,w,h]=box;const vw=viewport.clientWidth,vh=viewport.clientHeight,pad=19;
const s=Math.min((vw-pad*2)/w,(vh-pad*2)/h);scale=Math.max(.08,Math.min(s,8));
tx=(vw-w*scale)/2-x*scale;ty=(vh-h*scale)/2-y*scale;render(immediate);}
function activate(n){index=Math.max(0,Math.min(n,zones.length-1));buttons.forEach((b,i)=>b.setAttribute("aria-pressed",String(i===index)));position.textContent=zones[index].name;fitBox(zones[index].box);buttons[index]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"});}
function zoom(f){const cx=viewport.clientWidth/2,cy=viewport.clientHeight/2,ns=Math.max(.1,Math.min(8,scale*f));tx=cx-(cx-tx)*(ns/scale);ty=cy-(cy-ty)*(ns/scale);scale=ns;render();}
document.getElementById("previous").onclick=()=>activate(index-1);
document.getElementById("next").onclick=()=>activate(index+1);
document.getElementById("fit").onclick=()=>activate(index);
document.getElementById("zoom-in").onclick=()=>zoom(1.25);
document.getElementById("zoom-out").onclick=()=>zoom(1/1.25);
buttons.forEach((b,i)=>b.onclick=()=>activate(i));
const fullBtn=document.getElementById("fullscreen");
fullBtn.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){notify("브라우저에서 전체화면 사용을 허용해 주세요.");}};
document.addEventListener("fullscreenchange",()=>{const on=Boolean(document.fullscreenElement);fullBtn.setAttribute("aria-pressed",String(on));fullBtn.textContent=on?"⛶ 전체화면 종료":"⛶ 전체화면";setTimeout(()=>fitBox(zones[index].box),60);});
document.addEventListener("keydown",e=>{if(e.target.matches("button,a,input,textarea")&&e.key===" ")return;
if(["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();activate(index+1);}
else if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();activate(index-1);}
else if(e.key==="0"||e.key==="Home"){e.preventDefault();activate(0);}
else if(e.key.toLowerCase()==="f"){e.preventDefault();fullBtn.click();}
else if(e.key==="+"||e.key==="="){e.preventDefault();zoom(1.25);}
else if(e.key==="-"){e.preventDefault();zoom(.8);}
});
viewport.addEventListener("wheel",e=>{e.preventDefault();const r=viewport.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,ns=Math.max(.1,Math.min(8,scale*Math.exp(-e.deltaY*.0012)));tx=x-(x-tx)*(ns/scale);ty=y-(y-ty)*(ns/scale);scale=ns;render();},{passive:false});
viewport.addEventListener("pointerdown",e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,tx,ty};viewport.setPointerCapture(e.pointerId);canvas.classList.add("dragging");});
viewport.addEventListener("pointermove",e=>{if(!drag)return;tx=drag.tx+e.clientX-drag.x;ty=drag.ty+e.clientY-drag.y;render(true);});
function stop(){drag=null;canvas.classList.remove("dragging");}viewport.addEventListener("pointerup",stop);viewport.addEventListener("pointercancel",stop);
function notify(s){const m=document.getElementById("message");m.hidden=false;m.textContent=s;setTimeout(()=>{m.hidden=true},3500);}
const handleMissing=()=>{const m=document.getElementById("message");m.hidden=false;m.textContent="최종 포스터 파일(poster-final.jpg)을 GitHub 저장소 루트에 업로드하면 이 화면에 표시됩니다.";};
poster.addEventListener("error",handleMissing);if(poster.complete&&poster.naturalWidth===0)handleMissing();
window.addEventListener("resize",()=>fitBox(zones[index].box,true));
requestAnimationFrame(()=>fitBox(zones[0].box,true));
})();