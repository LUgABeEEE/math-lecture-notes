/* ============================================================
   MathLab · 数学交互实验引擎  v1.0
   ------------------------------------------------------------
   只在本工作区使用：源码在 数学语言/数学分析预习/engine/，
   构建时由 buildlib.py 内联进单文件 HTML；不装全局、不对外发布。

   用法
     HTML:  <div class="lab" data-lab="seq-eps"></div>
     JS  :  MathLab.absorb({ "seq-eps": { name, ctrls, anim, draw, foot } });
   引擎在 DOMContentLoaded 自动扫描 .lab[data-lab] 并初始化。

   API：absorb(obj) / boot() / axes / line / dot / tag / fmt / FONT / pal
   ============================================================ */
(function(global){
  "use strict";
var V=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();};
  function pal(){return {ink:V("--ink"),ink2:V("--ink-2"),ink3:V("--ink-3"),line:V("--line-2"),
    red:V("--red"),blue:V("--blue"),green:V("--green"),amber:V("--amber")};}
  var FONT='11px "Noto Sans CJK SC","PingFang SC",system-ui,sans-serif';
  function fmt(v){
    if(Math.abs(v)>=1000) return v.toFixed(0);
    if(Math.abs(v)>=10) return (+v.toFixed(1)).toString();
    if(Math.abs(v)>=1) return (+v.toFixed(2)).toString();
    return (+v.toFixed(3)).toString();
  }
  function axes(ctx,w,h,p,xr,yr,pad){
    pad=pad||{l:50,r:20,t:16,b:30};
    var iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
    var X=function(x){return pad.l+(x-xr[0])/(xr[1]-xr[0])*iw;};
    var Y=function(y){return pad.t+(yr[1]-y)/(yr[1]-yr[0])*ih;};
    ctx.save();
    ctx.strokeStyle=p.line;ctx.lineWidth=1;
    for(var i=0;i<=4;i++){
      var gx=pad.l+iw*i/4, gy=pad.t+ih*i/4;
      ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ih);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+iw,gy);ctx.stroke();
    }
    ctx.strokeStyle=p.ink3;ctx.lineWidth=1.1;
    if(yr[0]<0&&yr[1]>0){var y0=Y(0);ctx.beginPath();ctx.moveTo(pad.l,y0);ctx.lineTo(pad.l+iw,y0);ctx.stroke();}
    if(xr[0]<0&&xr[1]>0){var x0=X(0);ctx.beginPath();ctx.moveTo(x0,pad.t);ctx.lineTo(x0,pad.t+ih);ctx.stroke();}
    ctx.fillStyle=p.ink3;ctx.font=FONT;ctx.textAlign="right";ctx.textBaseline="middle";
    ctx.fillText(fmt(xr[0]),pad.l-6,pad.t+ih+2);
    ctx.textAlign="center";
    ctx.fillText(fmt(xr[1]),pad.l+iw,pad.t+ih+14);
    ctx.textAlign="left";
    ctx.fillText(fmt(yr[1]),6,pad.t+4);
    ctx.fillText(fmt(yr[0]),6,pad.t+ih-2);
    ctx.restore();
    return {X:X,Y:Y,iw:iw,ih:ih,pad:pad,w:w,h:h,rx:xr,ry:yr};
  }
  function line(ctx,m,x1,y1,x2,y2,color,dash,lw){
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=lw||1.6;ctx.setLineDash(dash||[]);
    ctx.beginPath();ctx.moveTo(m.X(x1),m.Y(y1));ctx.lineTo(m.X(x2),m.Y(y2));ctx.stroke();ctx.restore();
  }
  function dot(ctx,m,x,y,color,r){
    ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.arc(m.X(x),m.Y(y),r||3.4,0,7);ctx.fill();ctx.restore();
  }
  function tag(ctx,m,x,y,text,color,dx,dy){
    ctx.save();ctx.fillStyle=color;ctx.font=FONT;ctx.textAlign="left";ctx.textBaseline="middle";
    ctx.fillText(text,m.X(x)+(dx||6),m.Y(y)+(dy||-10));ctx.restore();
  }



  /* ---- 高层绘图助手 ---- */
  function plot(ctx, m, fn, opt){
    opt = opt || {};
    var from = opt.from !== undefined ? opt.from : m.rx[0];
    var to   = opt.to   !== undefined ? opt.to   : m.rx[1];
    var steps = opt.steps || Math.max(160, Math.round(m.iw));
    var lo = m.ry[0], hi = m.ry[1], started = false;
    ctx.save();
    ctx.strokeStyle = opt.color || "currentColor";
    ctx.lineWidth = opt.width || 2.2;
    ctx.setLineDash(opt.dash || []);
    ctx.beginPath();
    for(var i=0;i<=steps;i++){
      var x = from + (to-from)*i/steps, y = fn(x);
      if(!isFinite(y) || y > hi || y < lo){ started = false; continue; }
      if(!started){ ctx.moveTo(m.X(x), m.Y(y)); started = true; }
      else ctx.lineTo(m.X(x), m.Y(y));
    }
    ctx.stroke(); ctx.restore();
  }

  function band(ctx, m, a, b, color, alpha){
    var lo = Math.min(a,b), hi = Math.max(a,b);
    var yt = Math.max(m.Y(hi), m.pad.t), yb = Math.min(m.Y(lo), m.pad.t + m.ih);
    if(yb <= yt) return;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.12 : alpha;
    ctx.fillStyle = color;
    ctx.fillRect(m.pad.l, yt, m.iw, yb - yt);
    ctx.restore();
  }

  function vband(ctx, m, a, b, color, alpha){
    var lo = Math.min(a,b), hi = Math.max(a,b);
    var xl = Math.max(m.X(lo), m.pad.l), xr = Math.min(m.X(hi), m.pad.l + m.iw);
    if(xr <= xl) return;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.12 : alpha;
    ctx.fillStyle = color;
    ctx.fillRect(xl, m.pad.t, xr - xl, m.ih);
    ctx.restore();
  }

  function area(ctx, m, fn, from, to, color, alpha){
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 0.16 : alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(m.X(from), m.Y(0));
    var steps = 240;
    for(var i=0;i<=steps;i++){
      var x = from + (to-from)*i/steps;
      ctx.lineTo(m.X(x), m.Y(fn(x)));
    }
    ctx.lineTo(m.X(to), m.Y(0));
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function legend(ctx, m, items, opt){
    opt = opt || {};
    var x = m.pad.l + (opt.dx === undefined ? 10 : opt.dx);
    var y = m.pad.t + (opt.dy === undefined ? 10 : opt.dy);
    ctx.save();
    ctx.font = FONT; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    items.forEach(function(it, i){
      ctx.fillStyle = it.color;
      ctx.fillRect(x, y + i*16, 12, 3);
      ctx.fillText(it.label, x + 18, y + i*16 + 1);
    });
    ctx.restore();
  }

  var labs = {};
  var redraws=[];
  function build(root){
    var id=root.getAttribute("data-lab"), cfg=labs[id];
    if(!cfg) return;
    root.innerHTML='<div class="lab-bar"><span class="lab-tag">交互实验 · '+cfg.name+
      '</span><span class="lab-tools"></span></div>'+
      '<canvas></canvas><div class="lab-ctrl"></div><div class="lab-foot"></div>';
    var bar=root.querySelector(".lab-bar"), tools=root.querySelector(".lab-tools"),
        cv=root.querySelector("canvas"), ctrl=root.querySelector(".lab-ctrl"), foot=root.querySelector(".lab-foot");
    var st={}, inputs={}, outs={}, metas={};
    cfg.ctrls.forEach(function(c){
      var l=document.createElement("label");
      l.innerHTML='<span>'+c.label+'</span><input type="range" min="'+c.min+'" max="'+c.max+
        '" step="'+c.step+'" value="'+c.val+'"><output></output>';
      var inp=l.querySelector("input"), out=l.querySelector("output");
      st[c.k]=c.val; inputs[c.k]=inp; outs[c.k]=out; metas[c.k]=c;
      var show=function(){out.textContent=(c.fmt!==undefined&&c.fmt>0)?(+inp.value).toFixed(c.fmt):String(inp.value);};
      inp.addEventListener("input",function(){stopAnim();st[c.k]=+inp.value;show();draw();});
      show();ctrl.appendChild(l);
    });

    function setVal(k,v){
      st[k]=v;
      var inp=inputs[k]; if(inp) inp.value=v;
      var o=outs[k], c=metas[k];
      if(o) o.textContent=(c.fmt!==undefined&&c.fmt>0)?(+v).toFixed(c.fmt):String(Math.round(v));
    }
    function draw(){
      var w=cv.clientWidth||600,hh=cv.clientHeight||282;
      var dpr=Math.min(window.devicePixelRatio||1,2);
      if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(hh*dpr)){
        cv.width=Math.round(w*dpr);cv.height=Math.round(hh*dpr);
      }
      var ctx=cv.getContext("2d");
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,hh);
      cfg.draw(ctx,w,hh,pal(),st);
      foot.innerHTML=cfg.foot(st);
    }

    /* ---- 自动演示 ---- */
    var raf=null, t0=0, playing=false, animBtn=null;
    function stopAnim(){
      if(!playing&&!raf) return;
      playing=false; if(raf) cancelAnimationFrame(raf); raf=null; t0=0;
      if(animBtn) animBtn.textContent="▶ 自动演示";
    }
    function tick(ts){
      if(!playing) return;
      if(!t0) t0=ts;
      var dur=cfg.anim.ms||4800;
      var ph=((ts-t0)%(dur*2))/dur;
      var u=ph<=1?ph:2-ph;
      var e=u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
      setVal(cfg.anim.k, cfg.anim.from+(cfg.anim.to-cfg.anim.from)*e);
      draw();
      raf=requestAnimationFrame(tick);
    }
    if(cfg.anim){
      animBtn=document.createElement("button");
      animBtn.type="button"; animBtn.className="lab-btn"; animBtn.textContent="▶ 自动演示";
      animBtn.addEventListener("click",function(){
        if(playing){stopAnim();return;}
        playing=true; animBtn.textContent="⏸ 暂停"; t0=0; raf=requestAnimationFrame(tick);
      });
      tools.appendChild(animBtn);
    }

    /* ---- 全屏 ---- */
    if(document.fullscreenEnabled){
      var fsBtn=document.createElement("button");
      fsBtn.type="button"; fsBtn.className="lab-btn"; fsBtn.textContent="全屏";
      fsBtn.addEventListener("click",function(){
        if(document.fullscreenElement) document.exitFullscreen();
        else if(root.requestFullscreen) root.requestFullscreen();
      });
      document.addEventListener("fullscreenchange",function(){
        fsBtn.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
        setTimeout(draw,80);
      });
      tools.appendChild(fsBtn);
    }

    redraws.push(draw);
    if(window.ResizeObserver) new ResizeObserver(function(){draw();}).observe(cv);
    else window.addEventListener("resize",draw);
    draw();
  }
  function boot(){Array.prototype.forEach.call(document.querySelectorAll(".lab[data-lab]"),build);}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
  document.addEventListener("themechange",function(){redraws.forEach(function(f){f();});});

  function absorb(obj){
    for(var k in obj){ if(Object.prototype.hasOwnProperty.call(obj,k)) labs[k]=obj[k]; }
  }

  global.MathLab = {
    version: "1.0",
    absorb: absorb, boot: boot, labs: labs,
    axes: axes, line: line, dot: dot, tag: tag, fmt: fmt, FONT: FONT, pal: pal,
    plot: plot, band: band, vband: vband, area: area, legend: legend
  };

})(window);
