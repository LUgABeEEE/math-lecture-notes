#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建公共库：把 shell 模板、引擎、实验定义、MathJax 拼成一个自包含 HTML。

引擎与实验定义的边界
  engine/mathlab.js   通用框架（坐标、绘图助手、滑块/动画/全屏、注册表）
  engine/mathlab.css  实验外观
  src/labs.js         本书的 11 个实验定义（调用 MathLab.absorb）
三者都只在**本工作区**内使用，构建时内联，不产任何全局安装。
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ENGINE = os.path.join(ROOT, "engine")
ASSETS = os.path.join(ROOT, "assets")

ENGINE_JS = os.path.join(ENGINE, "mathlab.js")
LABS_JS = os.path.join(SRC, "labs.js")
ENGINE_CSS_FILES = [os.path.join(ENGINE, "mathlab.css")]


def read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def safe_js(js: str, name: str) -> str:
    """内联进 <script> 前唯一必须处理的序列。"""
    out = js.replace("</script", "<\\/script")
    if "</script" in out:
        raise SystemExit(f"{name}: 仍含 </script，不能内联")
    return out


def prepare_body(raw: str) -> str:
    """把 data-k 从 .box 挪到 .tag，并在构建期写死 定义/定理/例 的编号。"""
    body = re.sub(
        r'class="box (thm|prop|lem|cor)" data-k="([^"]+)"><div class="tag">',
        r'class="box \1"><div class="tag" data-k="\2">',
        raw,
    )

    number_re = re.compile(
        r'<section class="chap" id="[^"]+"[^>]*data-no="([^"]+)"'
        r'|<div class="box (def|thm|prop|lem|cor|ex)"[^>]*>\s*<div class="tag"(?: data-k="([^"]+)")?>'
    )

    out, pos = [], 0
    ch, cdef, cres, cex = "?", 0, 0, 0
    for m in number_re.finditer(body):
        out.append(body[pos:m.start()])
        pos = m.end()
        if m.group(1) is not None:                       # 新的一章：重置计数
            raw_no = m.group(1)
            ch = str(int(raw_no)) if raw_no.isdigit() else raw_no
            cdef = cres = cex = 0
            out.append(m.group(0))
            continue
        kind, label = m.group(2), m.group(3)
        if kind == "def":
            cdef += 1
            txt = f"定义 {ch}.{cdef}"
        elif kind == "ex":
            cex += 1
            txt = f"例 {ch}.{cex}"
        else:
            cres += 1
            txt = f"{label or '定理'} {ch}.{cres}"
        out.append(m.group(0) + f'<span class="num">{txt}</span>\u3000')
    out.append(body[pos:])
    return "".join(out)



# ---------------- 讲解视频内联 ----------------
import base64

VIDEO_DIR = os.path.join(ROOT, "videos")


def _b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def embed_videos(html: str, mode: str = "link") -> str:
    """把 <div class="vid" data-video="key" data-title="..."></div> 换成视频。

    mode="link"   : 视频走 videos/ 相对路径（页面小，即点即播；GitHub Pages 用这个）
    mode="inline" : 视频与封面 base64 内嵌（单文件离线版）
    两种模式都把视频收进 <details>，默认折叠，避免连排两屏。
    """
    def repl(m):
        key, title = m.group(1), m.group(2) or ""
        mp4 = os.path.join(VIDEO_DIR, f"{key}.mp4")
        jpg = os.path.join(VIDEO_DIR, f"poster-{key}.jpg")
        if not os.path.exists(mp4):
            return f'<p class="vid-missing">（视频 {key} 尚未生成）</p>'

        if mode == "inline":
            poster = f' poster="data:image/jpeg;base64,{_b64(jpg)}"' if os.path.exists(jpg) else ""
            src = f"data:video/mp4;base64,{_b64(mp4)}"
        else:
            poster = f' poster="videos/poster-{key}.jpg"' if os.path.exists(jpg) else ""
            src = f"videos/{key}.mp4"

        cap = f"<figcaption>{title}</figcaption>" if title else ""
        label = ("▶ 看动画 · " + title) if title else "▶ 看动画"
        return (
            f'<details class="vid-wrap"><summary>{label}</summary>'
            '<figure class="vid">'
            f'<video controls muted loop playsinline preload="none"{poster}>'
            f'<source src="{src}" type="video/mp4">你的浏览器不支持内嵌视频。</video>'
            f"{cap}</figure></details>"
        )

    return re.sub(r'<div class="vid" data-video="([^"]+)"(?: data-title="([^"]*)")?></div>',
                  repl, html)

def assemble(content_html: str, with_mathjax: bool = True, video_mode: str = "link") -> str:
    shell = read(os.path.join(SRC, "shell.html"))
    css = safe_js("\n".join(read(p) for p in ENGINE_CSS_FILES), "engine css")
    js = safe_js(read(ENGINE_JS), "engine js")
    labs = safe_js(read(LABS_JS), "labs js")

    if with_mathjax:
        mathjax = safe_js(read(os.path.join(ASSETS, "tex-svg.js")), "mathjax")
    else:
        mathjax = "/* mathjax omitted */"

    content_html = embed_videos(content_html, video_mode)
    return (
        shell.replace("{{CONTENT}}", content_html)
        .replace("{{ENGINE_CSS}}", css)
        .replace("{{ENGINE_JS}}", js)
        .replace("{{LABS_JS}}", labs)
        .replace("{{MATHJAX}}", mathjax)
    )


def content_parts() -> list:
    import glob

    parts = sorted(glob.glob(os.path.join(SRC, "[0-9]*.html")) + glob.glob(os.path.join(SRC, "zz-*.html")))
    if not parts:
        raise SystemExit("src/ 下没有内容分片")
    return parts
