import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const stage=document.querySelector("#stage");
const scene=new THREE.Scene();
scene.background=new THREE.Color("#20242c");

const camera=new THREE.PerspectiveCamera(35,1,0.1,100);
camera.position.set(5.8,4.1,8.8);

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.target.set(0,3.2,0);

scene.add(new THREE.HemisphereLight(0xffffff,0x4a5260,2.0));
const key=new THREE.DirectionalLight(0xffffff,3);
key.position.set(4,8,7); scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,1.2);
fill.position.set(-5,4,-4); scene.add(fill);

const ground=new THREE.Mesh(
  new THREE.CircleGeometry(6,64),
  new THREE.MeshStandardMaterial({color:0x15181e,roughness:1})
);
ground.rotation.x=-Math.PI/2; ground.position.y=0; scene.add(ground);

const rig=new THREE.Group(); scene.add(rig);
const parts={};
const baseMaterials={skin:new THREE.MeshStandardMaterial({color:0xf2b879}),shirt:new THREE.MeshStandardMaterial({color:0x4d75a8}),pants:new THREE.MeshStandardMaterial({color:0x33445e})};

function box(name,size,pos,material){
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
  m.name=name; m.position.set(...pos); rig.add(m); parts[name]=m; return m;
}
parts.Head=box("Head",[1.9,1.9,1.9],[0,6.35,0],baseMaterials.skin);
parts.Torso=box("Torso",[2.6,3,1.35],[0,4.0,0],baseMaterials.shirt);
parts["Left Arm"]=box("Left Arm",[1.25,3,1.25],[-1.93,4.0,0],baseMaterials.shirt);
parts["Right Arm"]=box("Right Arm",[1.25,3,1.25],[1.93,4.0,0],baseMaterials.shirt);
parts["Left Leg"]=box("Left Leg",[1.25,3,1.3],[-.67,1.0,0],baseMaterials.pants);
parts["Right Leg"]=box("Right Leg",[1.25,3,1.3],[.67,1.0,0],baseMaterials.pants);

function addFaceGrid(mat, img, region){
  const c=document.createElement("canvas"); c.width=256;c.height=256;
  const ctx=c.getContext("2d"); ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,region.x,region.y,region.w,region.h,0,0,256,256);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter;
  mat.map=tex; mat.color.set(0xffffff); mat.needsUpdate=true;
}
function loadImage(file, cb){
  const url=URL.createObjectURL(file); const img=new Image();
  img.onload=()=>{cb(img);URL.revokeObjectURL(url)}; img.src=url;
}
// Classic Roblox template dimensions are commonly 585x559.
// Regions below correspond to the large torso/limb blocks. They are intentionally
// approximate so this remains a dependency-free, browser-only previewer.
function applyShirt(img){
  const w=img.naturalWidth,h=img.naturalHeight;
  const torso=new THREE.MeshStandardMaterial({color:0xffffff});
  addFaceGrid(torso,img,{x:w*0.25,y:h*0.25,w:w*0.25,h:h*0.5});
  parts.Torso.material=torso;
  const armL=new THREE.MeshStandardMaterial({color:0xffffff}), armR=armL.clone();
  addFaceGrid(armL,img,{x:w*0.0,y:h*0.25,w:w*0.125,h:h*0.5});
  addFaceGrid(armR,img,{x:w*0.625,y:h*0.25,w:w*0.125,h:h*0.5});
  parts["Left Arm"].material=armL; parts["Right Arm"].material=armR;
}
function applyPants(img){
  const w=img.naturalWidth,h=img.naturalHeight;
  const legL=new THREE.MeshStandardMaterial({color:0xffffff}), legR=legL.clone();
  addFaceGrid(legL,img,{x:w*0.25,y:h*0.75,w:w*0.125,h:h*0.25});
  addFaceGrid(legR,img,{x:w*0.625,y:h*0.75,w:w*0.125,h:h*0.25});
  parts["Left Leg"].material=legL; parts["Right Leg"].material=legR;
}

document.querySelectorAll("[data-part]").forEach(x=>x.addEventListener("change",()=>{
  parts[x.dataset.part].visible=x.checked;
}));
document.querySelector("#shirtFile").addEventListener("change",e=>{
  const f=e.target.files[0]; if(f) loadImage(f,applyShirt);
});
document.querySelector("#pantsFile").addEventListener("change",e=>{
  const f=e.target.files[0]; if(f) loadImage(f,applyPants);
});
document.querySelector("#clearShirt").onclick=()=>{
  parts.Torso.material=baseMaterials.shirt;
  parts["Left Arm"].material=baseMaterials.shirt;
  parts["Right Arm"].material=baseMaterials.shirt;
  document.querySelector("#shirtFile").value="";
};
document.querySelector("#clearPants").onclick=()=>{
  parts["Left Leg"].material=baseMaterials.pants;
  parts["Right Leg"].material=baseMaterials.pants;
  document.querySelector("#pantsFile").value="";
};
document.querySelector("#bg").oninput=e=>scene.background.set(e.target.value);
document.querySelector("#resetView").onclick=()=>{camera.position.set(5.8,4.1,8.8);controls.target.set(0,3.2,0);controls.update()};
document.querySelector("#frontView").onclick=()=>{camera.position.set(0,3.5,10);controls.target.set(0,3.2,0);controls.update()};
document.querySelector("#backView").onclick=()=>{camera.position.set(0,3.5,-10);controls.target.set(0,3.2,0);controls.update()};

function getAssetId(value){
  const digits=(value.match(/\d+/g)||[]);
  return digits.length ? digits[digits.length-1] : null;
}
async function fetchThumb(id){
  const url=`https://thumbnails.roblox.com/v1/assets?assetIds=${encodeURIComponent(id)}&size=420x420&format=Png&isCircular=false`;
  const r=await fetch(url); if(!r.ok) throw new Error("Roblox thumbnail request failed");
  const j=await r.json(); return j.data?.[0]?.imageUrl||null;
}
const assetInput=document.querySelector("#assetInput");
const assetStatus=document.querySelector("#assetStatus");
const items=document.querySelector("#items");
const savedAssets=[];
function renderAssets(){
  items.innerHTML="";
  savedAssets.forEach((a,i)=>{
    const div=document.createElement("div");div.className="asset";
    div.innerHTML=`<img src="${a.thumb||""}" alt=""><div><div class="name">${escapeHtml(a.name||"Roblox asset")}</div><div class="id">Asset ID: ${a.id}</div></div><button data-i="${i}">×</button>`;
    div.querySelector("button").onclick=()=>{savedAssets.splice(i,1);renderAssets()};
    items.appendChild(div);
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
document.querySelector("#addAsset").onclick=async()=>{
  const id=getAssetId(assetInput.value.trim());
  if(!id){assetStatus.textContent="Enter a Roblox asset ID or a Roblox URL containing an ID.";return}
  assetStatus.textContent="Loading thumbnail…";
  try{
    const thumb=await fetchThumb(id);
    savedAssets.push({id,thumb,name:"Roblox asset"});
    renderAssets();
    assetStatus.textContent=thumb?"Added.":"Added, but Roblox did not return a thumbnail.";
    assetInput.value="";
  }catch(e){assetStatus.textContent="Could not load that public thumbnail. Check the ID/link or try again."}
};

document.querySelector("#saveProject").onclick=()=>{
  const project={
    version:1,
    visibility:Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,v.visible])),
    background:"#20242c",
    assets:savedAssets
  };
  const blob=new Blob([JSON.stringify(project,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="r6-outfit-project.json";a.click();
};
document.querySelector("#loadProject").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const p=JSON.parse(await f.text());
    if(p.visibility) Object.entries(p.visibility).forEach(([k,v])=>{if(parts[k]){parts[k].visible=!!v;const c=document.querySelector(`[data-part="${CSS.escape(k)}"]`);if(c)c.checked=!!v}});
    savedAssets.length=0;(p.assets||[]).forEach(a=>savedAssets.push(a));renderAssets();
  }catch{alert("That file is not a valid R6 project JSON.")}
};

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
new ResizeObserver(resize).observe(stage); resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)} animate();
