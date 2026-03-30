#!/usr/bin/env python3
"""Generate markdown report from HSP application research JSON results."""

import json
import glob
import os
import re
import yaml

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")
FIELDS_PATH = os.path.join(SCRIPT_DIR, "fields.yaml")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "report.md")

# Category mapping for field lookup
CATEGORY_MAPPING = {
    "basic_info": ["basic_info", "Basic Info"],
    "hsp_principle": ["hsp_principle", "HSP Principle"],
    "input_data": ["input_data", "Input Data"],
    "accuracy": ["accuracy", "Accuracy"],
    "implementation": ["implementation", "Implementation"],
    "literature": ["literature", "Literature"],
    "industry_application": ["industry_application", "Industry Application"],
}

# Category display names
CATEGORY_DISPLAY = {
    "basic_info": "Basic Info",
    "hsp_principle": "HSP Principle",
    "input_data": "Input Data",
    "accuracy": "Accuracy & Limitations",
    "implementation": "Implementation",
    "literature": "Literature & References",
    "industry_application": "Industry Application",
}

# TOC summary fields
TOC_FIELDS = [
    ("basic_info", "category", "Category"),
    ("basic_info", "maturity_level", "Maturity"),
    ("implementation", "complexity", "Complexity"),
    ("accuracy", "accuracy_level", "Accuracy"),
    ("implementation", "ui_pattern", "UI Pattern"),
    ("input_data", "data_availability_score", "Data Avail."),
]

# Fields to skip in detailed output (shown in header or internal)
SKIP_FIELDS = {"name", "name_ja", "category"}
INTERNAL_FIELDS = {"_source_file", "uncertain"}
SECTION_KEYS = set(CATEGORY_MAPPING.keys())


def load_fields_yaml():
    """Load field definitions from fields.yaml."""
    with open(FIELDS_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_all_results():
    """Load all JSON result files."""
    results = []
    for path in sorted(glob.glob(os.path.join(RESULTS_DIR, "*.json"))):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["_source_file"] = os.path.basename(path)
        results.append(data)
    return results


def get_field(data, section, field):
    """Get field value from nested or flat JSON structure."""
    # Try nested first
    if section in data and isinstance(data[section], dict):
        if field in data[section]:
            return data[section][field]
    # Try category mapping
    for alt_key in CATEGORY_MAPPING.get(section, []):
        if alt_key in data and isinstance(data[alt_key], dict):
            if field in data[alt_key]:
                return data[alt_key][field]
    # Try flat
    if field in data:
        return data[field]
    # Traverse all nested dicts
    for k, v in data.items():
        if isinstance(v, dict) and field in v:
            return v[field]
    return None


def is_uncertain(data, field_name, value):
    """Check if a field value should be skipped due to uncertainty."""
    if value is None or value == "":
        return True
    if isinstance(value, str) and "[uncertain]" in value:
        return True
    uncertain_list = data.get("uncertain", [])
    if field_name in uncertain_list:
        return True
    return False


def format_value(value, indent=0):
    """Format a value for markdown output."""
    if isinstance(value, list):
        if len(value) == 0:
            return "None"
        # List of dicts
        if isinstance(value[0], dict):
            lines = []
            for item in value:
                parts = [f"**{k}**: {v}" for k, v in item.items() if v]
                lines.append("  " * indent + "- " + " | ".join(parts))
            return "\n" + "\n".join(lines)
        # Short list
        if all(isinstance(v, str) and len(v) < 50 for v in value) and len(value) <= 5:
            return ", ".join(str(v) for v in value)
        # Long list
        lines = ["  " * indent + f"- {v}" for v in value]
        return "\n" + "\n".join(lines)
    elif isinstance(value, dict):
        parts = [f"**{k}**: {v}" for k, v in value.items() if v]
        return "; ".join(parts)
    elif isinstance(value, str) and len(value) > 120:
        return value
    else:
        return str(value)


def slugify(text):
    """Create anchor-compatible slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    return slug


def generate_report():
    """Generate the full markdown report."""
    fields_def = load_fields_yaml()
    results = load_all_results()

    # Group by category
    categories = {}
    for r in results:
        cat = get_field(r, "basic_info", "category") or "Unknown"
        categories.setdefault(cat, []).append(r)

    lines = []

    # Header
    lines.append("# HSP-based Property Estimation & Prediction Applications")
    lines.append("")
    lines.append(f"> **Generated**: 2026-03-21 | **Items**: {len(results)} | **Categories**: {len(categories)}")
    lines.append(">")
    lines.append("> Comprehensive research on Hansen Solubility Parameter applications for property estimation,")
    lines.append("> covering 8 industry domains from polymer science to computational methods.")
    lines.append("")

    # Maturity summary
    maturity_counts = {}
    for r in results:
        m = get_field(r, "basic_info", "maturity_level") or "unknown"
        maturity_counts[m] = maturity_counts.get(m, 0) + 1

    lines.append("## Overview")
    lines.append("")
    lines.append("| Maturity | Count |")
    lines.append("|----------|-------|")
    for m in ["mature", "established", "emerging"]:
        lines.append(f"| {m} | {maturity_counts.get(m, 0)} |")
    lines.append("")

    # Category summary
    lines.append("| Category | Count |")
    lines.append("|----------|-------|")
    for cat in sorted(categories.keys()):
        lines.append(f"| {cat} | {len(categories[cat])} |")
    lines.append("")

    # TOC
    lines.append("## Table of Contents")
    lines.append("")

    item_num = 0
    for cat in sorted(categories.keys()):
        lines.append(f"### {cat}")
        lines.append("")
        lines.append("| # | Application | Maturity | Complexity | Accuracy | UI Pattern | Data Avail. |")
        lines.append("|---|------------|----------|-----------|----------|-----------|------------|")

        for r in sorted(categories[cat], key=lambda x: get_field(x, "basic_info", "name") or ""):
            item_num += 1
            name = get_field(r, "basic_info", "name") or "Unknown"
            slug = slugify(name)

            toc_vals = []
            for section, field, _ in TOC_FIELDS[1:]:  # skip category
                val = get_field(r, section, field)
                if val is None or is_uncertain(r, field, val):
                    toc_vals.append("-")
                else:
                    toc_vals.append(str(val))

            lines.append(f"| {item_num} | [{name}](#{slug}) | {' | '.join(toc_vals)} |")

        lines.append("")

    # Detailed sections
    lines.append("---")
    lines.append("")
    lines.append("## Detailed Research Results")
    lines.append("")

    for cat in sorted(categories.keys()):
        lines.append(f"### Category: {cat}")
        lines.append("")

        for r in sorted(categories[cat], key=lambda x: get_field(x, "basic_info", "name") or ""):
            name = get_field(r, "basic_info", "name") or "Unknown"
            name_ja = get_field(r, "basic_info", "name_ja") or ""
            maturity = get_field(r, "basic_info", "maturity_level") or ""
            description = get_field(r, "basic_info", "description") or ""

            lines.append(f"#### {name}")
            if name_ja:
                lines.append(f"**Japanese**: {name_ja} | **Maturity**: {maturity}")
            else:
                lines.append(f"**Maturity**: {maturity}")
            lines.append("")
            if description and not is_uncertain(r, "description", description):
                lines.append(f"> {description}")
                lines.append("")

            # Each field category
            for section_key, display_name in CATEGORY_DISPLAY.items():
                if section_key == "basic_info":
                    continue  # Already shown in header

                section_data = None
                for alt_key in CATEGORY_MAPPING.get(section_key, [section_key]):
                    if alt_key in r and isinstance(r[alt_key], dict):
                        section_data = r[alt_key]
                        break

                if not section_data:
                    continue

                section_fields = []
                field_defs = fields_def.get(section_key, {})

                for field_name, field_def in field_defs.items():
                    if field_name in SKIP_FIELDS:
                        continue
                    if not isinstance(field_def, dict):
                        continue

                    value = section_data.get(field_name)
                    if is_uncertain(r, field_name, value):
                        continue

                    desc = field_def.get("description", field_name)
                    formatted = format_value(value)
                    section_fields.append((field_name, desc, formatted))

                if section_fields:
                    lines.append(f"**{display_name}**")
                    lines.append("")
                    for fname, fdesc, fval in section_fields:
                        if "\n" in fval:
                            lines.append(f"- **{fname}**: {fval}")
                        else:
                            lines.append(f"- **{fname}**: {fval}")
                    lines.append("")

            # Uncertain fields
            uncertain = r.get("uncertain", [])
            if uncertain:
                lines.append(f"**Uncertain fields**: {', '.join(uncertain)}")
                lines.append("")

            lines.append("---")
            lines.append("")

    # Write output
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Report generated: {OUTPUT_PATH}")
    print(f"  Items: {len(results)}")
    print(f"  Categories: {len(categories)}")
    print(f"  Lines: {len(lines)}")


if __name__ == "__main__":
    generate_report()
