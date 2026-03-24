#!/usr/bin/env python3
"""Generate HSP Textbook research report from chapter JSON files."""

import json
import os
import re
import sys
import yaml

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")
FIELDS_PATH = os.path.join(SCRIPT_DIR, "fields.yaml")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "report.md")

# TOC summary fields
TOC_FIELDS = ["estimated_pages", "difficulty_level"]

# Fields to skip in detailed output
SKIP_FIELDS = {"_source_file", "uncertain"}

# Part grouping
PARTS = [
    ("Part I: 基礎理論 (Fundamentals)", ["Ch01", "Ch02", "Ch03", "Ch04"]),
    ("Part II: 表面科学と接着 (Surface Science & Adhesion)", ["Ch05", "Ch06"]),
    ("Part III: 高分子科学 (Polymer Science)", ["Ch07", "Ch08"]),
    ("Part IV: 応用分野 (Application Domains)", ["Ch09", "Ch10", "Ch11", "Ch12", "Ch13", "Ch14", "Ch15"]),
    ("Part V: 先端手法と実践 (Advanced Methods & Practice)", ["Ch16", "Ch17", "Ch18", "Ch19", "Ch20"]),
]


def load_fields():
    with open(FIELDS_PATH, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return [field["name"] for field in data.get("fields", [])]


def load_results():
    results = {}
    for fname in sorted(os.listdir(RESULTS_DIR)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(RESULTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        key = fname.replace(".json", "")
        results[key] = data
    return results


def is_uncertain(data, field_name):
    uncertain_list = data.get("uncertain", [])
    val = data.get(field_name)
    if val is None or val == "":
        return True
    if isinstance(val, str) and "[uncertain]" in val:
        return True
    if field_name in uncertain_list:
        return True
    return False


def format_value(val, indent=0):
    if val is None or val == "":
        return "_N/A_"
    if isinstance(val, bool):
        return "Yes" if val else "No"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        if len(val) > 200:
            return val
        return val
    if isinstance(val, list):
        if not val:
            return "_empty_"
        if all(isinstance(v, str) for v in val):
            if all(len(v) < 60 for v in val) and len(val) <= 5:
                return ", ".join(val)
            lines = []
            for v in val:
                lines.append(f"  - {v}")
            return "\n" + "\n".join(lines)
        if all(isinstance(v, dict) for v in val):
            lines = []
            for v in val:
                parts = []
                for k2, v2 in v.items():
                    if isinstance(v2, str) and len(v2) > 100:
                        parts.append(f"**{k2}**: {v2[:100]}...")
                    else:
                        parts.append(f"**{k2}**: {v2}")
                lines.append(f"  - {' | '.join(parts)}")
            return "\n" + "\n".join(lines)
        lines = []
        for v in val:
            lines.append(f"  - {v}")
        return "\n" + "\n".join(lines)
    if isinstance(val, dict):
        lines = []
        for k2, v2 in val.items():
            lines.append(f"  - **{k2}**: {format_value(v2)}")
        return "\n" + "\n".join(lines)
    return str(val)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text


def generate_report(field_names, results):
    lines = []

    # Title
    lines.append("# Hansen Solubility Parameters: Theory, Computation, and Applications")
    lines.append("")
    lines.append("**HSP教科書 — 理論・計算・応用の体系的教科書**")
    lines.append("")
    lines.append(f"全{len(results)}章 | 本プロジェクトの117コアモジュール全てをカバー")
    lines.append("")

    # Summary stats
    total_pages = sum(d.get("estimated_pages", 0) for d in results.values())
    total_eqs = sum(len(d.get("equations", [])) for d in results.values())
    total_concepts = sum(len(d.get("key_concepts", [])) for d in results.values())
    total_examples = sum(len(d.get("worked_examples", [])) for d in results.values())
    total_refs = sum(len(d.get("key_references", [])) for d in results.values())
    total_figures = sum(len(d.get("figures_needed", [])) for d in results.values())
    total_questions = sum(len(d.get("review_questions", [])) for d in results.values())
    total_modules = len(set(
        m for d in results.values()
        for m in d.get("related_project_modules", [])
    ))

    lines.append("## 統計サマリー")
    lines.append("")
    lines.append(f"| 項目 | 値 |")
    lines.append(f"|------|-----|")
    lines.append(f"| 総ページ数（推定） | {total_pages} pp |")
    lines.append(f"| 方程式 | {total_eqs} |")
    lines.append(f"| キーコンセプト | {total_concepts} |")
    lines.append(f"| 演習問題 | {total_examples} |")
    lines.append(f"| 参考文献 | {total_refs} |")
    lines.append(f"| 図表 | {total_figures} |")
    lines.append(f"| 復習問題 | {total_questions} |")
    lines.append(f"| 対応モジュール数 | {total_modules} |")
    lines.append("")

    # Table of Contents
    lines.append("---")
    lines.append("")
    lines.append("## 目次 (Table of Contents)")
    lines.append("")

    ch_num = 0
    for part_title, ch_prefixes in PARTS:
        lines.append(f"### {part_title}")
        lines.append("")
        for prefix in ch_prefixes:
            for key, data in results.items():
                if key.startswith(prefix):
                    ch_num += 1
                    title_en = data.get("chapter_title_en", key)
                    title_ja = data.get("chapter_title", "")
                    pages = data.get("estimated_pages", "?")
                    diff = data.get("difficulty_level", "?")
                    n_eqs = len(data.get("equations", []))
                    n_mods = len(data.get("related_project_modules", []))
                    anchor = slugify(key)
                    lines.append(
                        f"{ch_num}. [{title_en}](#{anchor}) "
                        f"— {pages}pp | {diff} | {n_eqs} eqs | {n_mods} modules"
                    )
        lines.append("")

    # Detailed chapters
    lines.append("---")
    lines.append("")
    lines.append("## 各章詳細 (Chapter Details)")
    lines.append("")

    ch_num = 0
    for part_title, ch_prefixes in PARTS:
        lines.append(f"---")
        lines.append(f"# {part_title}")
        lines.append("")

        for prefix in ch_prefixes:
            for key, data in results.items():
                if not key.startswith(prefix):
                    continue
                ch_num += 1
                uncertain_list = data.get("uncertain", [])
                anchor = slugify(key)

                title_en = data.get("chapter_title_en", key)
                title_ja = data.get("chapter_title", "")

                lines.append(f"## Chapter {ch_num}: {title_en}")
                lines.append(f"**{title_ja}**")
                lines.append("")

                # Render each field
                for field_name in field_names:
                    if field_name in SKIP_FIELDS:
                        continue
                    if field_name in ("chapter_title", "chapter_title_en"):
                        continue
                    if is_uncertain(data, field_name):
                        continue

                    val = data.get(field_name)
                    if val is None or val == "" or val == []:
                        continue

                    display_name = field_name.replace("_", " ").title()
                    formatted = format_value(val)

                    if "\n" in formatted:
                        lines.append(f"### {display_name}")
                        lines.append(formatted)
                        lines.append("")
                    else:
                        lines.append(f"**{display_name}:** {formatted}")
                        lines.append("")

                # Extra fields not in fields.yaml
                extra_fields = set(data.keys()) - set(field_names) - SKIP_FIELDS
                if extra_fields:
                    lines.append("### Other Info")
                    for ef in sorted(extra_fields):
                        val = data.get(ef)
                        if val is not None and val != "":
                            lines.append(f"**{ef}:** {format_value(val)}")
                    lines.append("")

                lines.append("")

    # Uncertain items summary
    lines.append("---")
    lines.append("")
    lines.append("## Uncertain Items Summary")
    lines.append("")
    lines.append("以下のフィールドは不確実としてマークされています：")
    lines.append("")
    for key, data in results.items():
        uncertain = data.get("uncertain", [])
        if uncertain:
            title = data.get("chapter_title_en", key)
            lines.append(f"### {title}")
            for u in uncertain:
                lines.append(f"  - {u}")
            lines.append("")

    return "\n".join(lines)


def main():
    field_names = load_fields()
    results = load_results()
    report = generate_report(field_names, results)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"Report generated: {OUTPUT_PATH}")
    print(f"Chapters: {len(results)}")
    print(f"Size: {len(report)} chars")


if __name__ == "__main__":
    main()
