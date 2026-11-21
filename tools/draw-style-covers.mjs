// Draws the covers for the cartoon story styles with code (canvas), the same way
// the viral "made with Claude" 2D shorts are made. The free AI picture service
// cannot draw these looks (egg heads, silhouettes, stick figures) accurately.
//   node tools/draw-style-covers.mjs        → img/styles/<id>.webp for the ids below
// Needs playwright (Chromium) and ffmpeg.
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'img', 'styles');

// Everything below runs inside the browser page.
const DRAW = String.raw`
const W=640,H=480;
function ctxFor(){const c=document.createElement('canvas');c.width=W;c.height=H;return [c,c.getContext('2d')];}
const R=(a,b)=>a+Math.random()*(b-a);
function rr(x,y,w,h,r){const p=new Path2D();p.moveTo(x+r,y);p.arcTo(x+w,y,x+w,y+h,r);p.arcTo(x+w,y+h,x,y+h,r);p.arcTo(x,y+h,x,y,r);p.arcTo(x,y,x+w,y,r);p.closePath();return p;}
function words(x,t,cx,cy,size,fill){x.save();x.font='900 '+size+'px Arial Black, Arial';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
 x.lineWidth=size*0.24;x.strokeStyle='#000';x.strokeText(t,cx,cy);x.fillStyle=fill||'#fff';x.fillText(t,cx,cy);x.restore();}
// An egg-head cartoon character. o: {hat, coat, belt, chef, mood}
function egg(x,cx,cy,s,o){
 const ol='#111';x.save();x.translate(cx,cy);x.lineWidth=3.2*s;x.strokeStyle=ol;x.lineCap='round';x.lineJoin='round';
 // legs
 x.beginPath();x.moveTo(-14*s,70*s);x.lineTo(-16*s,128*s);x.moveTo(14*s,70*s);x.lineTo(16*s,128*s);x.lineWidth=5*s;x.stroke();
 x.fillStyle='#222';x.beginPath();x.ellipse(-22*s,130*s,12*s,6*s,0,0,7);x.ellipse(22*s,130*s,12*s,6*s,0,0,7);x.fill();
 // body
 const body=rr(-34*s,0,68*s,78*s,26*s);x.fillStyle=o.coat;x.fill(body);x.lineWidth=3.2*s;x.stroke(body);
 if(o.belt){x.fillStyle=o.belt;x.fillRect(-33*s,52*s,66*s,9*s);}
 if(o.chef){x.fillStyle='#fff';x.fill(rr(-22*s,14*s,44*s,56*s,10*s));x.stroke(rr(-22*s,14*s,44*s,56*s,10*s));}
 else{x.fillStyle='#f5c400';for(let i=0;i<3;i++){x.beginPath();x.arc(0,16*s+i*14*s,4*s,0,7);x.fill();}}
 // arms
 x.lineWidth=5*s;x.beginPath();x.moveTo(-32*s,14*s);x.quadraticCurveTo(-58*s,34*s,-52*s,60*s);x.moveTo(32*s,14*s);x.quadraticCurveTo(58*s,26*s,o.point?78*s:52*s,o.point?4*s:58*s);x.stroke();
 x.fillStyle='#fff';x.beginPath();x.arc(-52*s,62*s,7*s,0,7);x.arc(o.point?80*s:52*s,o.point?2*s:60*s,7*s,0,7);x.fill();x.lineWidth=2.5*s;x.stroke();
 // head (egg)
 x.fillStyle='#fdfcf7';x.beginPath();x.ellipse(0,-46*s,48*s,56*s,0,0,7);x.fill();x.lineWidth=3.5*s;x.stroke();
 x.fillStyle='rgba(0,0,0,.07)';x.beginPath();x.ellipse(14*s,-36*s,30*s,40*s,0,0,7);x.fill();
 // face
 x.fillStyle=ol;const ey=-44*s;
 x.beginPath();x.ellipse(-15*s,ey,5*s,7*s,0,0,7);x.ellipse(15*s,ey,5*s,7*s,0,0,7);x.fill();
 x.lineWidth=4*s;x.beginPath();
 if(o.mood==='angry'){x.moveTo(-26*s,ey-16*s);x.lineTo(-7*s,ey-9*s);x.moveTo(26*s,ey-16*s);x.lineTo(7*s,ey-9*s);}
 else if(o.mood==='shock'){x.moveTo(-24*s,ey-18*s);x.quadraticCurveTo(-15*s,ey-24*s,-6*s,ey-18*s);x.moveTo(24*s,ey-18*s);x.quadraticCurveTo(15*s,ey-24*s,6*s,ey-18*s);}
 else{x.moveTo(-24*s,ey-13*s);x.lineTo(-7*s,ey-15*s);x.moveTo(24*s,ey-13*s);x.lineTo(7*s,ey-15*s);}
 x.stroke();
 if(o.mood==='shock'){x.fillStyle='#5a1a1a';x.beginPath();x.ellipse(0,-18*s,9*s,12*s,0,0,7);x.fill();}
 else{x.lineWidth=3.5*s;x.beginPath();x.arc(0,-26*s,12*s,0.15*Math.PI,0.85*Math.PI);x.stroke();}
 if(o.mustache){x.fillStyle='#6b4423';x.beginPath();x.ellipse(-9*s,-27*s,10*s,5*s,-0.2,0,7);x.ellipse(9*s,-27*s,10*s,5*s,0.2,0,7);x.fill();}
 // hats
 if(o.hat==='captain'){x.fillStyle='#22398f';x.beginPath();x.ellipse(0,-94*s,46*s,20*s,0,0,7);x.fill();x.lineWidth=3*s;x.stroke();
  x.fillStyle='#111';x.beginPath();x.ellipse(0,-82*s,40*s,9*s,0,0,Math.PI);x.fill();
  x.fillStyle='#f5c400';x.beginPath();x.arc(0,-96*s,7*s,0,7);x.fill();x.fillStyle='#e23b3b';x.beginPath();x.arc(0,-96*s,3*s,0,7);x.fill();}
 if(o.hat==='chef'){x.fillStyle='#fff';x.beginPath();x.arc(-18*s,-112*s,20*s,0,7);x.arc(0,-122*s,22*s,0,7);x.arc(18*s,-112*s,20*s,0,7);x.fill();x.lineWidth=3*s;x.stroke();
  x.fillRect(-26*s,-108*s,52*s,26*s);x.strokeRect(-26*s,-108*s,52*s,26*s);}
 if(o.hat==='top'){x.fillStyle='#111';x.fillRect(-26*s,-140*s,52*s,46*s);x.fillRect(-40*s,-98*s,80*s,8*s);x.fillStyle='#b8323a';x.fillRect(-26*s,-108*s,52*s,8*s);}
 x.restore();
}
// A round-head stick figure. o: {color, eye, face, sil}
function stickman(x,cx,cy,s,o){
 x.save();x.translate(cx,cy);x.lineCap='round';x.lineJoin='round';const col=o.color;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=7*s;
 x.beginPath();x.moveTo(0,-20*s);x.lineTo(0,50*s);x.moveTo(0,50*s);x.lineTo(-20*s,100*s);x.moveTo(0,50*s);x.lineTo(22*s,100*s);
 x.moveTo(0,0);x.lineTo(o.armL?o.armL[0]*s:-30*s,o.armL?o.armL[1]*s:38*s);x.moveTo(0,0);x.lineTo(o.armR?o.armR[0]*s:30*s,o.armR?o.armR[1]*s:38*s);x.stroke();
 x.beginPath();x.arc(0,-48*s,30*s,0,7);x.fill();
 x.fillStyle=o.eye||'#000';x.beginPath();x.ellipse(-10*s,-52*s,4.5*s,o.scared?7*s:5*s,0,0,7);x.ellipse(10*s,-52*s,4.5*s,o.scared?7*s:5*s,0,0,7);x.fill();
 if(o.smile){x.strokeStyle=o.eye;x.lineWidth=3*s;x.beginPath();x.arc(0,-40*s,9*s,0.2*Math.PI,0.8*Math.PI);x.stroke();}
 if(o.scared){x.fillStyle=o.eye;x.beginPath();x.ellipse(0,-33*s,5*s,7*s,0,0,7);x.fill();}
 x.restore();
}
const COVERS={
 'claude-cartoon'(){const [c,x]=ctxFor();
  let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7cc6f2');g.addColorStop(.42,'#cfeefd');g.addColorStop(.43,'#1f6fa8');g.addColorStop(.6,'#2a8bc9');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='#fff';[[90,60],[470,40],[560,90]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,22,0,7);x.arc(a+26,b-8,26,0,7);x.arc(a+52,b,20,0,7);x.fill();});
  x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<18;i++){x.fillRect(R(0,W),R(210,280),R(20,60),3);}
  // deck
  x.fillStyle='#a0612d';x.beginPath();x.moveTo(0,300);x.lineTo(W,280);x.lineTo(W,H);x.lineTo(0,H);x.fill();
  x.strokeStyle='#6e3d18';x.lineWidth=3;for(let i=0;i<9;i++){x.beginPath();x.moveTo(0,300+i*22);x.lineTo(W,280+i*25);x.stroke();}
  x.fillStyle='#7a2b1f';x.fillRect(0,282,W,22);x.fillStyle='#c98d4f';x.fillRect(0,276,W,8);
  x.fillStyle='#6e3d18';x.fillRect(78,0,22,300);x.fillStyle='#e23b3b';x.beginPath();x.moveTo(100,20);x.lineTo(160,40);x.lineTo(100,60);x.fill();
  // ice blocks crate
  x.fillStyle='#8a5a2b';x.fillRect(470,300,110,70);x.strokeStyle='#4d2f12';x.lineWidth=4;x.strokeRect(470,300,110,70);
  x.fillStyle='#cdefff';for(let i=0;i<3;i++){x.fillRect(480+i*33,276,28,28);x.strokeStyle='#7fb8d6';x.strokeRect(480+i*33,276,28,28);}
  egg(x,250,250,1.15,{hat:'captain',coat:'#2b47b5',belt:'#d8383a',mood:'angry',mustache:true,point:true});
  egg(x,400,268,.95,{hat:'chef',coat:'#e9e4da',chef:true,mood:'shock'});
  words(x,'SOLD ICE?!',W/2,425,54);
  return c;},
 'stickman-horror'(){const [c,x]=ctxFor();
  x.fillStyle='#0b0d0c';x.fillRect(0,0,W,H);
  // corridor in perspective
  const vx=W/2,vy=210;x.fillStyle='#171c1a';x.beginPath();x.moveTo(0,0);x.lineTo(vx-50,vy-60);x.lineTo(vx-50,vy+60);x.lineTo(0,H);x.fill();
  x.fillStyle='#141917';x.beginPath();x.moveTo(W,0);x.lineTo(vx+50,vy-60);x.lineTo(vx+50,vy+60);x.lineTo(W,H);x.fill();
  x.fillStyle='#1d2421';x.beginPath();x.moveTo(0,H);x.lineTo(vx-50,vy+60);x.lineTo(vx+50,vy+60);x.lineTo(W,H);x.fill();
  let g=x.createRadialGradient(vx,vy,4,vx,vy,90);g.addColorStop(0,'rgba(120,255,140,.95)');g.addColorStop(1,'rgba(40,120,60,0)');x.fillStyle=g;x.fillRect(vx-100,vy-100,200,200);
  x.fillStyle='#062';x.fillRect(vx-22,vy-50,44,100);x.fillStyle='#000';stickman(x,vx,vy+8,.45,{color:'#000',eye:'#9f9'});
  [[60,70],[120,180]].forEach(([a,w])=>{x.fillStyle='#0f1311';x.fillRect(a,150,w/3,190);});
  // flashlight beam
  x.fillStyle='rgba(255,240,150,.25)';x.beginPath();x.moveTo(205,300);x.lineTo(vx-30,vy-30);x.lineTo(vx+30,vy+40);x.fill();
  stickman(x,175,300,1.2,{color:'#f4f4f0',eye:'#000',scared:true,armR:[30,0]});
  x.fillStyle='#ffd23f';x.save();x.translate(212,298);x.rotate(-0.45);x.fillRect(-4,-6,30,12);x.restore();
  words(x,"DON'T LOOK BACK",W/2,420,44,'#fff');
  return c;},
 'silhouette-explainer'(){const [c,x]=ctxFor();
  let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e3a55a');g.addColorStop(1,'#a8642b');x.fillStyle=g;x.fillRect(0,0,W,H);
  // window with pyramids
  x.fillStyle='#ffcf7a';x.fillRect(250,60,150,180);g=x.createLinearGradient(0,60,0,240);g.addColorStop(0,'#ffb86b');g.addColorStop(1,'#ffe0a3');x.fillStyle=g;x.fillRect(262,72,126,156);
  x.fillStyle='#fff3c4';x.beginPath();x.arc(350,120,16,0,7);x.fill();
  x.fillStyle='#c8873d';[[290,228,60],[345,228,44]].forEach(([a,b,s])=>{x.beginPath();x.moveTo(a-s,b);x.lineTo(a,b-s*0.9);x.lineTo(a+s,b);x.fill();});
  // columns with hieroglyph bands
  [[40,'#c9813c'],[540,'#c9813c']].forEach(([a,col])=>{x.fillStyle=col;x.fillRect(a,40,60,330);x.fillStyle='#7d4a1e';for(let i=0;i<6;i++)x.fillRect(a+8,70+i*48,44,6);x.fillStyle='#2c6e8f';x.fillRect(a,40,60,18);});
  // shelves with scrolls
  x.fillStyle='#6b3d16';x.fillRect(430,120,90,8);x.fillRect(430,180,90,8);x.fillStyle='#f3e2b3';for(let i=0;i<4;i++){x.beginPath();x.ellipse(445+i*22,110,9,9,0,0,7);x.ellipse(445+i*22,170,9,9,0,0,7);x.fill();}
  // table
  x.fillStyle='#5e3412';x.fillRect(150,320,340,22);x.fillRect(170,340,16,90);x.fillRect(454,340,16,90);
  // papyrus
  x.fillStyle='#f6e7b8';x.fillRect(250,300,140,22);x.strokeStyle='#9a6a2a';x.lineWidth=2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(262+i*24,306);x.lineTo(278+i*24,306);x.stroke();}
  // lamp glow
  g=x.createRadialGradient(320,290,5,320,290,180);g.addColorStop(0,'rgba(255,230,160,.55)');g.addColorStop(1,'rgba(255,230,160,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
  // two silhouettes with white eyes
  stickman(x,215,250,1.15,{color:'#141414',eye:'#fff',smile:true,armR:[40,52]});
  stickman(x,430,255,1.05,{color:'#141414',eye:'#fff',smile:true,armL:[-40,50]});
  x.fillStyle='#141414';x.beginPath();x.moveTo(190,182);x.lineTo(240,182);x.lineTo(232,166);x.lineTo(198,166);x.fill();
  return c;},
 'stick'(){const [c,x]=ctxFor();
  x.fillStyle='#1f1b45';x.fillRect(0,0,W,H);
  // bed
  x.fillStyle='#3b3570';x.fill(rr(90,300,460,70,18));x.fillStyle='#e9e4ff';x.fill(rr(110,262,120,50,20));
  x.fillStyle='#5e56a8';x.fill(rr(220,280,320,60,16));
  // stick figure sitting in bed (signature: white head, yellow scarf, navy hoodie)
  x.save();x.lineCap='round';x.strokeStyle='#fff';x.lineWidth=10;
  x.beginPath();x.moveTo(210,282);x.lineTo(230,200);x.stroke();
  x.strokeStyle='#22306b';x.lineWidth=26;x.beginPath();x.moveTo(214,268);x.lineTo(228,214);x.stroke();
  x.strokeStyle='#fff';x.lineWidth=9;x.beginPath();x.moveTo(226,220);x.quadraticCurveTo(262,236,282,216);x.stroke();
  x.fillStyle='#fff';x.beginPath();x.arc(238,158,42,0,7);x.fill();
  x.fillStyle='#1f1b45';x.beginPath();x.ellipse(250,154,5,11,0,0,7);x.ellipse(270,154,5,11,0,0,7);x.fill();
  x.strokeStyle='#f5c400';x.lineWidth=12;x.beginPath();x.moveTo(206,200);x.lineTo(252,204);x.moveTo(214,202);x.lineTo(196,236);x.stroke();
  x.restore();
  // phone glow
  x.fillStyle='#9fe8ff';x.fill(rr(282,196,22,38,5));let g=x.createRadialGradient(293,215,4,293,215,90);g.addColorStop(0,'rgba(140,220,255,.5)');g.addColorStop(1,'rgba(140,220,255,0)');x.fillStyle=g;x.fillRect(180,120,240,200);
  // glowing brain
  x.save();x.translate(450,140);x.fillStyle='#ff8fb1';[[0,0,40],[-30,8,28],[30,8,28],[-14,-24,26],[16,-24,26]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill();});
  x.strokeStyle='#d65c86';x.lineWidth=4;x.beginPath();x.moveTo(0,-36);x.lineTo(0,34);x.stroke();
  x.strokeStyle='#ffd166';x.lineWidth=5;for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6;x.beginPath();x.moveTo(Math.cos(a)*62,Math.sin(a)*56);x.lineTo(Math.cos(a)*80,Math.sin(a)*72);x.stroke();}
  x.restore();
  words(x,'WHY YOU PROCRASTINATE',W/2,420,36,'#fff');
  return c;},
 'before-after'(){const [c,x]=ctxFor();
  const half=(dx,messy)=>{x.save();x.beginPath();x.rect(dx,0,W/2,H);x.clip();
   x.fillStyle=messy?'#9aa1a6':'#bfe3f5';x.fillRect(dx,0,W/2,H);
   x.fillStyle=messy?'#7d746a':'#e9dfcf';x.fillRect(dx,300,W/2,180);
   x.fillStyle=messy?'#6d7377':'#ffffff';for(let i=0;i<7;i++)x.fillRect(dx+10+i*44,230,10,80);x.fillRect(dx,226,W/2,10);
   if(messy){[['#8b6b4a',40,330,70,50],['#a67c52',120,350,60,40],['#6e6e6e',200,320,50,70],['#c2b8a3',70,390,90,30]].forEach(([col,a,b,w,h])=>{x.fillStyle=col;x.fillRect(dx+a,b,w,h);});
    x.strokeStyle='#4a4a4a';x.lineWidth=4;for(let i=0;i<6;i++){x.beginPath();x.moveTo(dx+R(20,300),R(320,460));x.lineTo(dx+R(20,300),R(320,460));x.stroke();}}
   else{[[40,300],[110,280],[190,300],[260,285]].forEach(([a,b])=>{x.fillStyle='#b5651d';x.fillRect(dx+a,b+60,46,40);x.fillStyle='#3fa55b';
     for(let k=0;k<6;k++){x.beginPath();x.ellipse(dx+a+23+R(-22,22),b+R(0,50),14,26,R(-1,1),0,7);x.fill();}
     x.fillStyle=['#ff6b8b','#ffd166','#ff9f1c','#e76fff'][Math.floor(R(0,4))];for(let k=0;k<4;k++){x.beginPath();x.arc(dx+a+23+R(-20,20),b+R(-5,30),7,0,7);x.fill();}});
    x.fillStyle='#2e8b57';for(let i=0;i<10;i++){x.beginPath();x.ellipse(dx+R(0,320),R(0,90),24,40,R(-1,1),0,7);x.fill();}}
   x.restore();};
  half(0,true);half(W/2,false);x.fillStyle='#fff';x.fillRect(W/2-3,0,6,H);
  words(x,'BEFORE',W/4,50,40);words(x,'AFTER',W*3/4,50,40,'#ffd166');
  return c;},
 'paper'(){const [c,x]=ctxFor();
  x.fillStyle='#f3efe4';x.fillRect(0,0,W,H);
  x.fillStyle='#ffd56b';x.shadowColor='rgba(0,0,0,.2)';x.shadowBlur=14;x.shadowOffsetY=6;x.beginPath();x.arc(500,110,50,0,7);x.fill();
  [['#a9d8b8',260],['#7cc49a',320],['#4ea877',380]].forEach(([col,y],i)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,y);
   for(let k=0;k<=8;k++)x.quadraticCurveTo(k*80+40,y-60+((k+i)%2)*40,k*80+80,y);x.lineTo(W,H);x.lineTo(0,H);x.fill();});
  x.fillStyle='#8a5a33';x.fill(rr(300,368,60,16,8));
  // paper person
  x.fillStyle='#e95f5c';x.fill(rr(240,300,42,60,14));x.fillStyle='#ffe0bd';x.beginPath();x.arc(261,282,22,0,7);x.fill();
  x.fillStyle='#e95f5c';x.fill(rr(276,318,40,12,6));x.fillStyle='#3a3a3a';x.fill(rr(246,358,12,30,5));x.fill(rr(266,358,12,30,5));
  // seed + sprout
  x.fillStyle='#6b4423';x.beginPath();x.ellipse(330,364,7,5,0,0,7);x.fill();x.fillStyle='#4ea877';x.beginPath();x.ellipse(322,346,10,6,-0.6,0,7);x.ellipse(338,344,10,6,0.6,0,7);x.fill();
  x.shadowColor='transparent';
  return c;}
};
window.drawCovers=ids=>ids.map(id=>[id,COVERS[id]().toDataURL('image/png')]);
`;
const ids = process.argv[2] ? process.argv[2].split(',') : ['claude-cartoon', 'stickman-horror', 'silhouette-explainer', 'stick', 'paper', 'before-after'];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');
await page.addScriptTag({ content: DRAW });
for (const [id, url] of await page.evaluate(ids => window.drawCovers(ids), ids)) {
  const png = path.join(out, id + '.png');
  fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', 'scale=600:-2', '-quality', '85', path.join(out, id + '.webp')]);
  fs.unlinkSync(png);
  console.log('drew', id);
}
await browser.close();
