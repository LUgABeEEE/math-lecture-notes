/* ============================================================
   《数学分析》上册预习讲义 · 实验定义（11 个）
   依赖 engine/mathlab.js；只在本工作区使用。
   每个实验：name / ctrls / anim? / draw(ctx,w,h,p,st) / foot(st)
   ============================================================ */
(function(){
  "use strict";
  var ML = window.MathLab;
  if(!ML){ console.warn("[labs] MathLab 未加载"); return; }
  var axes = ML.axes, line = ML.line, dot = ML.dot, tag = ML.tag, fmt = ML.fmt, FONT = ML.FONT,
      plot = ML.plot, band = ML.band, vband = ML.vband, area = ML.area;

  ML.absorb({
    "sup":{
      anim:{k:"beta",from:1.28,to:0.55,ms:5200},
      name:"上确界 · β 能不能再压低？",
      ctrls:[{k:"beta",label:"β",min:0.5,max:1.3,step:0.005,val:1.15,fmt:3}],
      draw:function(ctx,w,h,p,st){
        var pad={l:52,r:24,t:30,b:40}, iw=w-pad.l-pad.r, y=h-pad.b;
        var X=function(x){return pad.l+(x/1.32)*iw;};
        ctx.save();ctx.fillStyle=p.red;ctx.globalAlpha=.10;
        ctx.fillRect(X(st.beta),pad.t,X(1.32)-X(st.beta),y-pad.t);ctx.restore();
        ctx.save();ctx.strokeStyle=p.ink3;ctx.lineWidth=1.3;
        ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+iw,y);ctx.stroke();
        ctx.fillStyle=p.ink3;ctx.font=FONT;ctx.textAlign="center";ctx.textBaseline="top";
        [0,0.25,0.5,0.75,1,1.25].forEach(function(t){
          ctx.beginPath();ctx.moveTo(X(t),y-4);ctx.lineTo(X(t),y+4);ctx.stroke();
          ctx.fillText(fmt(t),X(t),y+8);
        });ctx.restore();
        for(var n=1;n<=300;n++){var x=1-1/n;ctx.fillStyle=p.blue;
          ctx.beginPath();ctx.arc(X(x),y-18,1.9,0,7);ctx.fill();}
        ctx.save();ctx.fillStyle=p.blue;ctx.font=FONT;ctx.textAlign="left";ctx.textBaseline="middle";
        ctx.fillText("S = { 1 − 1/n }",X(0.02),y-46);ctx.restore();
        ctx.save();ctx.strokeStyle=p.red;ctx.lineWidth=1.8;ctx.setLineDash([5,4]);
        ctx.beginPath();ctx.moveTo(X(st.beta),y);ctx.lineTo(X(st.beta),pad.t-4);ctx.stroke();ctx.restore();
        ctx.save();ctx.fillStyle=p.red;ctx.font=FONT;ctx.textAlign="center";ctx.textBaseline="bottom";
        ctx.fillText("β = "+st.beta.toFixed(3),X(st.beta),pad.t-8);ctx.restore();

      },
      foot:function(st){
        var b=st.beta;
        if(b<1-1e-6) return "β 现在<b>还不是上界</b>：只要 n 取足够大，1−1/n 就会超过 β（红色区域里会冒出新点）。把 β 往右拖，越过 1 试试。";
        if(b>1+1e-6) return "β 现在是上界，但<b>不是最小的</b>：明明可以压到 1。上确界要求「再也压不下去」。";
        return "<span class='ok'>β = 1 就是最小上界</span>：再往左挪一丁点，就有 1−1/n 跑出去。所以 sup S = 1，而 1 ∉ S。";
      }
    },
    "seq-eps":{
      anim:{k:"eps",from:0.3,to:0.02,ms:5200},
      name:"ε-N · 尾巴能不能全进带子",
      ctrls:[{k:"eps",label:"ε",min:0.02,max:0.3,step:0.01,val:0.2,fmt:2}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,42],[0.6,2.15],{l:50,r:20,t:18,b:32});
        var e=st.eps;
        ctx.save();ctx.fillStyle=p.blue;ctx.globalAlpha=.13;
        var yT=Math.max(m.Y(1+e),m.pad.t), yB=Math.min(m.Y(1-e),m.pad.t+m.ih);
        ctx.fillRect(m.pad.l,yT,m.iw,Math.max(1,yB-yT));ctx.restore();
        line(ctx,m,0,1,42,1,p.ink3,[4,4],1.2);
        var N=Math.floor(1/e)+1;
        for(var n=1;n<=40;n++){
          var a=1+1/n;
          dot(ctx,m,n,a,(n>N?p.green:p.red),n>N?3.0:4.2);
        }
        if(N<=40) line(ctx,m,N+0.5,0.6,N+0.5,2.15,p.amber,[3,3],1.4);
        ctx.save();ctx.fillStyle=p.amber;ctx.font=FONT;ctx.textAlign="left";
        ctx.fillText("N = "+N,m.X(Math.min(N+1,36)),m.Y(2.05));ctx.restore();
      },
      foot:function(st){
        var e=st.eps,N=Math.floor(1/e)+1;
        return "ε = <b>"+e.toFixed(2)+"</b> → 取 N = <b>"+N+"</b>。从第 N+1 项起，"+
          "所有点都落在 1±ε 的蓝色带子里（绿色）；带子外只剩 <b>"+Math.min(N,40)+"</b> 个点——有限多个例外，这正是收敛的意思。";
      }
    },
    "fun-eps":{
      anim:{k:"eps",from:3.6,to:0.3,ms:5200},
      name:"ε-δ · δ 要多小才够",
      ctrls:[{k:"eps",label:"ε",min:0.2,max:4,step:0.1,val:1.2,fmt:1},
             {k:"delta",label:"δ",min:0.05,max:1.2,step:0.01,val:0.2,fmt:2}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,3.2],[0,10],{l:50,r:20,t:18,b:30});
        var d=st.delta,e=st.eps,x0=2,A=4;
        band(ctx,m,A-e,A+e,p.blue,.12);
        var worst=4*d+d*d;
        vband(ctx,m,x0-d,x0+d,(worst<e?p.green:p.red),.13);
        plot(ctx,m,function(x){return x*x;},{from:0,to:3.2,color:p.ink});
        line(ctx,m,x0-d,A+e,x0+d,A+e,p.blue,[4,4],1);
        line(ctx,m,x0-d,A-e,x0+d,A-e,p.blue,[4,4],1);
        line(ctx,m,x0,0,x0,10,p.ink3,[2,3],1);
        dot(ctx,m,x0,A,p.red,4.2);
      },
      foot:function(st){
        var d=st.delta,e=st.eps,worst=4*d+d*d;
        return (worst<e
          ?"<span class='ok'>这个 δ 合格</span>："
          :"<span class='no'>这个 δ 太大了</span>：")+
          "在 |x−2|&lt;δ 内，|x²−4| 最大能达到 4δ+δ² = <b>"+worst.toFixed(3)+
          "</b>，而要求是 &lt; ε = <b>"+e.toFixed(1)+"</b>。ε 变小，δ 就得跟着变小。";
      }
    },
    "secant":{
      anim:{k:"h",from:1.4,to:0.02,ms:5200},
      name:"割线 → 切线 · h 越来越小",
      ctrls:[{k:"h",label:"h",min:0.02,max:1.5,step:0.01,val:1.0,fmt:2}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,2.8],[0,8],{l:50,r:20,t:18,b:30});
        var hh=st.h,x0=1,y0=1;
        plot(ctx,m,function(x){return x*x;},{from:0,to:2.8,color:p.ink});
        var x1=x0+hh,y1=x1*x1,k=(y1-y0)/(x1-x0);
        line(ctx,m,0.05,y0+k*(0.05-x0),2.7,y0+k*(2.7-x0),p.red,[],1.8);
        line(ctx,m,0.05,y0+2*(0.05-x0),2.7,y0+2*(2.7-x0),p.green,[5,4],1.2);
        line(ctx,m,x0+hh,y0,x0+hh,y1,p.ink3,[3,3],1);
        dot(ctx,m,x0,y0,p.ink,4);dot(ctx,m,x1,y1,p.red,4);
        tag(ctx,m,x0,y0,"P(1,1)",p.ink2,-6,16);
        tag(ctx,m,x1,y1,"Q",p.red,6,-8);
      },
      foot:function(st){
        var k=2+st.h;
        return "割线斜率 k = [(1+h)²−1]/h = <b>2+h = "+k.toFixed(2)+"</b>。h 越小，Q 越贴近 P，割线越像切线；h→0 时 k→<b>2</b>，这就是 f′(1)。绿色虚线是真正的切线。";
      }
    },
    "riemann":{
      anim:{k:"n",from:1,to:60,ms:6000},
      name:"Riemann 和 · 矩形越多越像",
      ctrls:[{k:"n",label:"n",min:1,max:60,step:1,val:6,fmt:0}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,1],[0,1.05],{l:50,r:20,t:18,b:30});
        var n=Math.round(st.n);
        ctx.save();ctx.fillStyle=p.blue;ctx.globalAlpha=.16;
        for(var i=0;i<n;i++){
          var xl=i/n,xr=(i+1)/n,yy=xl*xl;
          ctx.fillRect(m.X(xl),m.Y(yy),m.X(xr)-m.X(xl),m.Y(0)-m.Y(yy));
          ctx.strokeStyle=p.blue;ctx.globalAlpha=.35;ctx.lineWidth=1;
          ctx.strokeRect(m.X(xl),m.Y(yy),m.X(xr)-m.X(xl),m.Y(0)-m.Y(yy));ctx.globalAlpha=.16;
          ctx.fillStyle=p.blue;
        }
        ctx.restore();
        ctx.save();ctx.strokeStyle=p.red;ctx.lineWidth=2.2;ctx.beginPath();
        for(var j=0;j<=200;j++){var x=((j/200)**1)*1;var y=x*x;if(j===0)ctx.moveTo(m.X(x),m.Y(y));else ctx.lineTo(m.X(x),m.Y(y));}
        ctx.stroke();ctx.restore();
        line(ctx,m,0,1/3,1,1/3,p.green,[5,4],1.3);
      },
      foot:function(st){
        var n=Math.round(st.n),s=0;
        for(var i=0;i<n;i++){s+=(i/n)*(i/n)*(1/n);}
        var err=Math.abs(s-1/3);
        return "n = <b>"+n+"</b>，左端点 Riemann 和 S<sub>n</sub> = <b>"+s.toFixed(4)+
          "</b>，与真值 1/3 相差 "+err.toFixed(4)+"。n 越大误差越小——但<b>不管 n 多大都不等于 1/3</b>，等号来自取极限。";
      }
    },
    "taylor":{
      anim:{k:"m",from:1,to:9,ms:6000},
      name:"Taylor 多项式逼近 sin x",
      ctrls:[{k:"m",label:"阶数 m",min:1,max:9,step:1,val:3,fmt:0}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[-4,4],[-2.2,2.2],{l:50,r:20,t:18,b:30});
        var mm=Math.round(st.m);
        function P(x){var s=0,t=x;for(var k=0;k<mm;k++){s+=t;t*=-x*x/((2*k+2)*(2*k+3));}return s;}
        plot(ctx,m,function(x){return Math.sin(x);},{from:-4,to:4,color:p.blue,width:2.4});
        plot(ctx,m,P,{from:-4,to:4,color:p.red,width:1.8,dash:[6,4]});
        ML.legend(ctx,m,[{label:"sin x",color:p.blue},{label:"P"+(2*mm-1)+"(x)",color:p.red}]);
      },
      foot:function(st){
        var mm=Math.round(st.m),mx=0;
        function P(x){var s=0,t=x;for(var k=0;k<mm;k++){s+=t;t*=-x*x/((2*k+2)*(2*k+3));}return s;}
        for(var i=0;i<=800;i++){var x=-Math.PI+2*Math.PI*i/800;mx=Math.max(mx,Math.abs(P(x)-Math.sin(x)));}
        return "P<sub>"+(2*mm-1)+"</sub>(x) = x − x³/3! + … ，在 [−π, π] 上的最大偏差约 <b>"+mx.toFixed(4)+
          "</b>。阶数越高，贴合区间越宽——但在 |x|&gt;π 附近会迅速跑偏（虚线冲出去）。";
      }
    },
    "uniform":{
      anim:{k:"x0",from:1,to:0.15,ms:5200},
      name:"一致连续 · 同一个 ε，δ 却越来越小",
      ctrls:[{k:"x0",label:"x₀",min:0.15,max:1,step:0.005,val:0.6,fmt:3}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,1.05],[0,7],{l:50,r:20,t:18,b:30});
        var x0=st.x0, e=0.35, y0=1/x0;
        var left=1/(1/x0+e), right=1/(1/x0-e);
        ctx.save();ctx.fillStyle=p.blue;ctx.globalAlpha=.12;
        ctx.fillRect(m.pad.l,m.Y(y0+e),m.iw,m.Y(y0-e)-m.Y(y0+e));ctx.restore();
        ctx.save();ctx.fillStyle=p.green;ctx.globalAlpha=.14;
        ctx.fillRect(m.X(left),m.pad.t,m.X(right)-m.X(left),m.ih);ctx.restore();
        plot(ctx,m,function(x){return 1/x;},{from:0.14,to:1.04,color:p.ink,steps:320});
        dot(ctx,m,x0,y0,p.red,4.2);
        ctx.save();ctx.fillStyle=p.red;ctx.font=FONT;ctx.textAlign="center";
        ctx.fillText("x₀",m.X(x0),m.Y(y0)-12);ctx.restore();
      },
      foot:function(st){
        var x0=st.x0,e=0.35,y0=1/x0;
        var left=1/(1/x0+e),right=1/(1/x0-e);
        var dl=x0-left,dr=right-x0,d=Math.min(dl,dr);
        return "取 ε = 0.35。要让 f(x)=1/x 的取值落在 y₀±ε 内，输入端只能允许 δ ≈ <b>"+d.toFixed(4)+
          "</b>。x₀ 越靠近 0，δ 就越小、而且<b>没有下限</b>——所以找不到一个对全区间通用的 δ，这正是「连续但不一致连续」。";
      }
    },
    "bisect":{
      anim:{k:"n",from:0,to:12,ms:6000},
      name:"二分法 · 区间套怎样夹住根",
      ctrls:[{k:"n",label:"步数 n",min:0,max:12,step:1,val:3,fmt:0}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0.8,1.9],[-1.6,2.2],{l:50,r:20,t:18,b:30});
        function f(x){return x*x*x-x-1;}
        var a=1,b=2;
        for(var i=0;i<st.n;i++){var c=(a+b)/2;if(f(c)===0){a=b=c;break;}if(f(a)*f(c)<0)b=c;else a=c;}
        ctx.save();ctx.fillStyle=p.blue;ctx.globalAlpha=.13;
        ctx.fillRect(m.X(a),m.pad.t,m.X(b)-m.X(a),m.ih);ctx.restore();
        ctx.save();ctx.strokeStyle=p.ink;ctx.lineWidth=2.2;ctx.beginPath();
        for(var j=0;j<=240;j++){var x=0.8+1.1*j/240,y=f(x);
          if(j===0)ctx.moveTo(m.X(x),m.Y(y));else ctx.lineTo(m.X(x),m.Y(y));}
        ctx.stroke();ctx.restore();
        line(ctx,m,0.8,0,1.9,0,p.ink3,[4,4],1.1);
        dot(ctx,m,(a+b)/2,0,p.red,4.4);
        ctx.save();ctx.fillStyle=p.red;ctx.font=FONT;ctx.textAlign="center";
        ctx.fillText("根 ≈ "+((a+b)/2).toFixed(6),m.X((a+b)/2),m.Y(0)-14);ctx.restore();
      },
      foot:function(st){
        var a=1,b=2;
        function f(x){return x*x*x-x-1;}
        for(var i=0;i<st.n;i++){var c=(a+b)/2;if(f(a)*f(c)<0)b=c;else a=c;}
        return "第 <b>"+st.n+"</b> 步后，根被夹在 ["+a.toFixed(6)+", "+b.toFixed(6)+
          "] 里，区间长度 "+(b-a).toFixed(6)+"。每步长度减半，<b>区间套</b>保证这些区间有唯一的公共点，那就是根。";
      }
    },
    "ptest":{
      anim:{k:"R",from:2,to:20,ms:5200},
      name:"p 积分 · 面积到底收不收敛",
      ctrls:[{k:"p",label:"p",min:0.4,max:2.6,step:0.05,val:1.4,fmt:2},
             {k:"R",label:"上限 R",min:2,max:20,step:0.5,val:8,fmt:1}],
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,20.5],[0,1.6],{l:50,r:20,t:18,b:30});
        var pp=st.p,R=st.R;
        area(ctx,m,function(x){return Math.pow(x,-pp);},1,R,p.blue,.16);
        plot(ctx,m,function(x){return Math.pow(x,-pp);},{from:1,to:20.5,color:p.ink,steps:320});
        line(ctx,m,R,0,R,1.6,p.red,[4,4],1.1);
      },
      foot:function(st){
        var pp=st.p,R=st.R,v;
        if(Math.abs(pp-1)<1e-6) v=Math.log(R); else v=(Math.pow(R,1-pp)-1)/(1-pp);
        var conv = pp>1;
        return "∫₁<sup>R</sup> x<sup>−"+pp.toFixed(2)+"</sup> dx = <b>"+v.toFixed(4)+"</b>（R="+R.toFixed(1)+"）。"+
          (conv?"p &gt; 1：R 再大也就停在 1/(p−1) = <b>"+(1/(pp-1)).toFixed(3)+"</b> 附近，<span class='ok'>收敛</span>。"
               :"p ≤ 1：R 越大值越大、<b>没有上界</b>，<span class='no'>发散</span>。");
      }
    },    "squeeze":{
      name:"夹逼准则 · 两边一挤，中间没处跑",
      ctrls:[{k:"n",label:"看第 n 项",min:2,max:30,step:1,val:8,fmt:0}],
      anim:{k:"n",from:2,to:30,ms:6000},
      draw:function(ctx,w,h,p,st){
        var m=axes(ctx,w,h,p,[0,31],[0.45,1.5],{l:50,r:20,t:22,b:30});
        var n0=Math.round(st.n);
        for(var n=2;n<=30;n++){
          var a=1-1/n,b=1+1/n,c=1+Math.sin(n)/n;
          ctx.globalAlpha=.55;
          ctx.fillStyle=p.blue;
          ctx.beginPath();ctx.arc(m.X(n),m.Y(a),2.4,0,7);ctx.fill();
          ctx.fillStyle=p.red;
          ctx.beginPath();ctx.arc(m.X(n),m.Y(b),2.4,0,7);ctx.fill();
          ctx.globalAlpha=1;
          ctx.fillStyle=p.green;
          ctx.beginPath();ctx.arc(m.X(n),m.Y(c),2.8,0,7);ctx.fill();
        }
        line(ctx,m,0,1,31,1,p.ink3,[4,4],1.1);
        line(ctx,m,n0,0.45,n0,1.5,p.amber,[3,3],1.4);
        var yy=[["aₙ = 1−1/n",p.blue],["cₙ = 1+sin n/n",p.green],["bₙ = 1+1/n",p.red]];
        ctx.save();ctx.font="11px 'Noto Sans CJK SC',system-ui,sans-serif";
        ctx.textAlign="left";ctx.textBaseline="middle";
        yy.forEach(function(t,i){ctx.fillStyle=t[1];ctx.fillRect(m.pad.l+8,m.pad.t+10+i*16,10,3);
          ctx.fillText(t[0],m.pad.l+24,m.pad.t+11+i*16);});
        ctx.restore();
      },
      foot:function(st){
        var n=Math.round(st.n),a=1-1/n,b=1+1/n,c=1+Math.sin(n)/n;
        return "第 "+n+" 项：aₙ = <b>"+a.toFixed(4)+"</b> ≤ cₙ = <b>"+c.toFixed(4)+
          "</b> ≤ bₙ = <b>"+b.toFixed(4)+"</b>。上下两条都往 1 挤，中间那条<b>没有别的去处</b>，只能跟着收敛到 1——这就是夹逼。";
      }
    },
    "break":{
      name:"间断点四型 · 拖动切换",
      ctrls:[{k:"kind",label:"类型",min:0,max:3,step:1,val:0,fmt:0}],
      draw:function(ctx,w,h,p,st){
        var k=Math.round(st.kind);
        var xr = k===3?[-0.55,0.55]:[-3,3];
        var yr = k===2?[-5,5]:[-1.8,2.2];
        var m=axes(ctx,w,h,p,xr,yr,{l:50,r:20,t:18,b:30});
        function curve(f,from,to,color,skip){
          ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2.2;ctx.beginPath();
          var started=false;
          for(var i=0;i<=600;i++){
            var x=from+(to-from)*i/600, y=f(x);
            if(!isFinite(y)||y>yr[1]||y<yr[0]||(skip&&Math.abs(x)<skip)){started=false;continue;}
            if(!started){ctx.moveTo(m.X(x),m.Y(y));started=true;}
            else ctx.lineTo(m.X(x),m.Y(y));
          }
          ctx.stroke();ctx.restore();
        }
        if(k===0){
          curve(function(x){return Math.sin(x)/x;},-3,3,p.ink,0.004);
          dot(ctx,m,0,1,p.ink,4.4);
          ctx.save();ctx.fillStyle=p.paper||"#fff";ctx.beginPath();ctx.arc(m.X(0),m.Y(1),3,0,7);ctx.fill();ctx.restore();
          ctx.save();ctx.strokeStyle=p.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(m.X(0),m.Y(1),4,0,7);ctx.stroke();ctx.restore();
          dot(ctx,m,0,0.5,p.red,4.4);
          tag(ctx,m,0,0.5,"f(0)=0.5",p.red,8,14);
        } else if(k===1){
          line(ctx,m,-3,-1,0,-1,p.ink,[],2.2);
          line(ctx,m,0,1,3,1,p.ink,[],2.2);
          ctx.save();ctx.strokeStyle=p.ink3;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);
          ctx.beginPath();ctx.moveTo(m.X(0),m.Y(-1));ctx.lineTo(m.X(0),m.Y(1));ctx.stroke();ctx.restore();
          dot(ctx,m,0,-1,p.blue,4);dot(ctx,m,0,1,p.blue,4);
          tag(ctx,m,0,-1,"左极限 −1",p.blue,-70,-8);tag(ctx,m,0,1,"右极限 1",p.blue,10,8);
        } else if(k===2){
          curve(function(x){return 1/x;},0.09,3,p.ink);
          curve(function(x){return 1/x;},-3,-0.09,p.ink);
          ctx.save();ctx.strokeStyle=p.red;ctx.lineWidth=1.4;ctx.setLineDash([5,4]);
          ctx.beginPath();ctx.moveTo(m.X(0),m.Y(yr[0]));ctx.lineTo(m.X(0),m.Y(yr[1]));ctx.stroke();ctx.restore();
          tag(ctx,m,0.2,3.4,"x → 0⁺ 冲到 +∞",p.red,6,0);
        } else {
          curve(function(x){return Math.sin(1/x);},-0.55,-0.004,p.ink);
          curve(function(x){return Math.sin(1/x);},0.004,0.55,p.ink);
          ctx.save();ctx.fillStyle=p.red;ctx.globalAlpha=.12;
          ctx.fillRect(m.X(-0.05),m.pad.t,m.X(0.05)-m.X(-0.05),m.ih);ctx.restore();
          tag(ctx,m,0.1,1.5,"越靠近 0 振荡越快",p.red,6,0);
        }
      },
      foot:function(st){
        var k=Math.round(st.kind);
        if(k===0) return "<b>可去间断点</b>：sin x / x 在 0 附近的极限是 1，但函数值取成了 0.5。补一句 f(0)=1 就连续了。";
        if(k===1) return "<b>跳跃间断点</b>：sgn x 的左极限 −1、右极限 1，两个都算得出来，但<b>不相等</b>，所以极限不存在。";
        if(k===2) return "<b>第二类（无穷型）</b>：1/x 在 0 处无界，右极限 +∞、左极限 −∞，连“趋于一个数”都谈不上。";
        return "<b>第二类（振荡型）</b>：sin(1/x) 在 0 附近无限次穿过每一个值，既不趋于数，也不趋于无穷——它只是不肯安定。";
      }
    },
  });
})();
