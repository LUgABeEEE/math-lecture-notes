#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从全书中抽出一章，生成单章样张（同样完全离线）。用法: python3 make_sample.py ch2"""
import os
import re
import sys

import buildlib

want = sys.argv[1] if len(sys.argv) > 1 else "ch2"

raw = "\n".join(buildlib.read(p) for p in buildlib.content_parts())

hero = re.search(r'<header class="hero">.*?</header>', raw, re.S)
sec = re.search(r'<section class="chap" id="%s".*?</section>\s*(?=<section|$)' % want, raw, re.S)
if not sec:
    sys.exit("chapter not found: " + want)

body = buildlib.prepare_body(sec.group(0))
html = buildlib.assemble((hero.group(0) if hero else "") + body)

dst = os.path.join(buildlib.ROOT, f"样张-{want}.html")
with open(dst, "w", encoding="utf-8") as f:
    f.write(html)
print("sample ->", dst, f"({len(html)/1048576:.2f} MB)")
