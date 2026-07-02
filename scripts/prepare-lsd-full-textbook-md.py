from __future__ import annotations

import argparse
import json
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_TXT = Path(r"C:\Users\LENOVO\Downloads\gt-lich-su-dang-csvn-ban-tuyen-giao-tw.ocr.txt")
DEFAULT_OUT_DIR = PROJECT_ROOT / "knowledge" / "lich-su-dang-full"


@dataclass
class Page:
    number: int
    lines: list[str]

    @property
    def text(self) -> str:
        return "\n".join(self.lines)

    @property
    def char_count(self) -> int:
        return len(self.text)


@dataclass
class Segment:
    index: int
    title: str
    chapter: str
    section: str
    pages: list[Page] = field(default_factory=list)
    filename: str = ""

    @property
    def page_numbers(self) -> list[int]:
        return [page.number for page in self.pages]

    @property
    def char_count(self) -> int:
        return sum(page.char_count for page in self.pages)


def strip_accents(value: str) -> str:
    value = value.replace("đ", "d").replace("Đ", "D")
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def normalize_key(value: str) -> str:
    value = strip_accents(value)
    value = re.sub(r"\s+", " ", value).strip().lower()
    return value


def slugify(value: str, max_length: int = 72) -> str:
    value = normalize_key(value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return (value[:max_length].strip("-") or "chunk")


def yaml_quote(value: str) -> str:
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{value}"'


def clean_line(line: str) -> str:
    line = line.replace("\t", " ")
    line = re.sub(r"\s+", " ", line)
    return line.strip()


def load_pages(source_txt: Path) -> list[Page]:
    if not source_txt.exists():
        raise FileNotFoundError(f"Missing OCR text file: {source_txt}")

    raw_text = source_txt.read_text(encoding="utf-8", errors="replace")
    raw_text = raw_text.replace("\ufeff", "").replace("\x00", "")
    raw_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    pages: list[Page] = []
    for index, raw_page in enumerate(raw_text.split("\f"), start=1):
        lines = [clean_line(raw_line) for raw_line in raw_page.splitlines()]
        lines = [line for line in lines if line]
        if lines:
            pages.append(Page(number=index, lines=lines))

    return pages


def is_numbered_title(line: str) -> bool:
    match = re.match(r"^[1-5]\.\s+(.+)$", line)
    if not match:
        return False

    rest = match.group(1).strip()
    if len(rest) > 145:
        return False
    if rest.count(".") > 1 or "? " in rest or "! " in rest:
        return False

    return len(rest.split()) >= 3


def classify_heading(line: str, *, inside_reference_or_question_list: bool) -> str:
    key = normalize_key(line)

    if re.match(r"^chuong\s+(nhap mon|\d+)\b", key):
        return "chapter"

    if key == "muc tieu":
        return "muc_tieu"

    if key.startswith("noi dung on tap va thao luan"):
        return "special"

    if key == "ket luan" or key.startswith("tai lieu chu yeu su dung"):
        return "special"

    if re.match(r"^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+\S", key):
        return "major"

    if not inside_reference_or_question_list and is_numbered_title(line):
        return "subsection"

    return "text"


def is_upper_title_line(line: str) -> bool:
    key = strip_accents(line)
    letters = [char for char in key if char.isalpha()]
    if not letters:
        return bool(re.fullmatch(r"\(?\d{4}\s*-\s*\d{4}\)?", line.strip()))

    uppercase = sum(1 for char in letters if char.isupper())
    return uppercase / len(letters) >= 0.75


def collect_chapter_title(lines: list[str], start_index: int) -> str:
    parts = [lines[start_index]]
    for line in lines[start_index + 1 : start_index + 8]:
        key = normalize_key(line)
        if key == "muc tieu":
            break
        if re.match(r"^(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+\S", key):
            break
        if re.match(r"^[1-5]\.\s+\S", line):
            break
        if not is_upper_title_line(line):
            break
        parts.append(line)

    return " - ".join(parts)


def page_range_label(page_numbers: list[int]) -> str:
    if not page_numbers:
        return ""
    start = min(page_numbers)
    end = max(page_numbers)
    return str(start) if start == end else f"{start}-{end}"


def scan_page_state(page: Page, chapter: str, section: str) -> tuple[str, str, str, bool]:
    next_chapter = chapter
    next_section = section
    page_title = section or chapter or "Bia va muc luc"
    has_strong_boundary = False

    for line_index, line in enumerate(page.lines):
        section_key = normalize_key(next_section)
        inside_list = section_key.startswith("noi dung on tap") or section_key.startswith("tai lieu chu yeu")
        kind = classify_heading(line, inside_reference_or_question_list=inside_list)

        if kind == "chapter":
            next_chapter = line
            next_section = collect_chapter_title(page.lines, line_index)
            page_title = next_section
            has_strong_boundary = True
        elif kind in {"major", "special"}:
            next_section = line
            page_title = line
            has_strong_boundary = True
        elif kind == "muc_tieu":
            next_section = line
            page_title = line
        elif kind == "subsection":
            next_section = line
            if page_title == "Bia va muc luc":
                page_title = line

    return next_chapter, next_section, page_title, has_strong_boundary


def build_segments(pages: list[Page], *, max_chars: int) -> list[Segment]:
    segments: list[Segment] = []
    current_pages: list[Page] = []
    current_title = "Bia va muc luc"
    current_chapter = "Bia va muc luc"
    current_section = ""

    def flush() -> None:
        nonlocal current_pages
        if not current_pages:
            return

        segments.append(
            Segment(
                index=len(segments) + 1,
                title=current_title,
                chapter=current_chapter,
                section=current_section or current_title,
                pages=list(current_pages),
            )
        )
        current_pages = []

    for page in pages:
        next_chapter, next_section, page_title, has_strong_boundary = scan_page_state(
            page,
            current_chapter,
            current_section,
        )
        current_chars = sum(item.char_count for item in current_pages)
        should_flush = bool(current_pages) and (
            has_strong_boundary or current_chars + page.char_count > max_chars
        )

        if should_flush:
            flush()

        if not current_pages:
            current_title = page_title
            current_chapter = next_chapter
            current_section = next_section

        current_pages.append(page)
        current_chapter = next_chapter
        current_section = next_section

    flush()
    return segments


def safe_clean_out_dir(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for pattern in ("textbook-*.md", "ocr-split-report.md", "manifest.json", "source-preservation-check.json"):
        for path in out_dir.glob(pattern):
            if path.is_file():
                path.unlink()


def write_segment(out_dir: Path, source_txt: Path, segment: Segment) -> None:
    slug = slugify(segment.title)
    segment.filename = f"textbook-{segment.index:03d}-{slug}.md"
    path = out_dir / segment.filename
    pages = page_range_label(segment.page_numbers)

    frontmatter = [
        "---",
        "subject: lich-su-dang",
        'topic: "giao-trinh-lich-su-dang-full"',
        'period: "1930-2018"',
        'source_type: "textbook_full_ocr_txt"',
        f"source: {yaml_quote(source_txt.name)}",
        f"title: {yaml_quote(segment.title)}",
        f"chapter: {yaml_quote(segment.chapter)}",
        f"section: {yaml_quote(segment.section)}",
        f'pages: "{pages}"',
        f'chunk_index: "{segment.index:03d}"',
        'priority: "primary"',
        'status: "full_ocr_text_preserved"',
        "---",
        "",
    ]

    body = [
        f"# {segment.title}",
        "",
        f"- Source file: `{source_txt}`",
        f"- Pages: {pages}",
        f"- Chunk: {segment.index:03d}",
        f"- Preservation: all non-empty OCR lines from the source page range are included.",
        "",
    ]

    for page in segment.pages:
        body.extend(
            [
                f"## Trang PDF {page.number}",
                "",
                f'<!-- OCR_PAGE_START page="{page.number}" -->',
                page.text,
                f'<!-- OCR_PAGE_END page="{page.number}" -->',
                "",
            ]
        )

    path.write_text("\n".join(frontmatter + body).strip() + "\n", encoding="utf-8")


def write_index(out_dir: Path, source_txt: Path, segments: list[Segment], total_pages: int) -> None:
    total_chars = sum(segment.char_count for segment in segments)
    lines = [
        "---",
        "subject: lich-su-dang",
        'topic: "giao-trinh-lich-su-dang-full"',
        'source_type: "textbook_full_ocr_index"',
        f"source: {yaml_quote(source_txt.name)}",
        'title: "Index - Giao trinh Lich su Dang CSVN full OCR"',
        'priority: "supporting"',
        'status: "generated_index"',
        "---",
        "",
        "# Index - Giao trinh Lich su Dang CSVN full OCR",
        "",
        f"- Source file: `{source_txt}`",
        f"- OCR pages with text: {total_pages}",
        f"- Markdown chunks: {len(segments)}",
        f"- Cleaned OCR characters inside chunks: {total_chars}",
        "",
        "## Chunk list",
        "",
    ]

    for segment in segments:
        pages = page_range_label(segment.page_numbers)
        lines.append(f"- `{segment.filename}` - pages {pages} - {segment.title}")

    (out_dir / "textbook-000-index.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


def write_report(out_dir: Path, source_txt: Path, pages: list[Page], segments: list[Segment], check: dict) -> None:
    lines = [
        "# OCR split report",
        "",
        f"- Source txt: `{source_txt}`",
        f"- Output dir: `{out_dir}`",
        f"- OCR pages with text: {len(pages)}",
        f"- Markdown chunks: {len(segments)}",
        f"- Cleaned OCR characters inside chunks: {sum(segment.char_count for segment in segments)}",
        f"- Source preservation check: {check['status']} ({check['matched_pages']}/{check['source_pages']} pages)",
        "",
        "## Generated files",
        "",
    ]

    for segment in segments:
        lines.append(
            f"- `{segment.filename}` - pages {page_range_label(segment.page_numbers)} - {segment.char_count} chars"
        )

    (out_dir / "ocr-split-report.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


def write_manifest(out_dir: Path, source_txt: Path, segments: list[Segment]) -> None:
    manifest = {
        "source": str(source_txt),
        "segments": [
            {
                "index": segment.index,
                "filename": segment.filename,
                "title": segment.title,
                "chapter": segment.chapter,
                "section": segment.section,
                "pages": segment.page_numbers,
                "char_count": segment.char_count,
            }
            for segment in segments
        ],
    }
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def verify_source_preservation(out_dir: Path, pages: list[Page], segments: list[Segment]) -> dict:
    expected = {page.number: page.lines for page in pages}
    actual: dict[int, list[str]] = {}
    block_re = re.compile(
        r'<!-- OCR_PAGE_START page="(\d+)" -->\n([\s\S]*?)\n<!-- OCR_PAGE_END page="\1" -->',
        flags=re.MULTILINE,
    )

    for segment in segments:
        text = (out_dir / segment.filename).read_text(encoding="utf-8")
        for match in block_re.finditer(text):
            page_number = int(match.group(1))
            block_lines = match.group(2).splitlines()
            actual.setdefault(page_number, []).extend(block_lines)

    missing_pages = sorted(set(expected) - set(actual))
    extra_pages = sorted(set(actual) - set(expected))
    mismatched_pages = [
        page_number
        for page_number in sorted(set(expected) & set(actual))
        if expected[page_number] != actual[page_number]
    ]

    check = {
        "status": "PASS" if not missing_pages and not extra_pages and not mismatched_pages else "FAIL",
        "source_pages": len(expected),
        "matched_pages": len(expected) - len(missing_pages) - len(mismatched_pages),
        "missing_pages": missing_pages,
        "extra_pages": extra_pages,
        "mismatched_pages": mismatched_pages[:50],
    }
    (out_dir / "source-preservation-check.json").write_text(
        json.dumps(check, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return check


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Split the full OCR txt textbook into Markdown chunks for an OpenAI vector store."
    )
    parser.add_argument("--source-txt", type=Path, default=DEFAULT_SOURCE_TXT)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--max-chars", type=int, default=9000)
    args = parser.parse_args()

    pages = load_pages(args.source_txt)
    segments = build_segments(pages, max_chars=args.max_chars)

    safe_clean_out_dir(args.out_dir)
    for segment in segments:
        write_segment(args.out_dir, args.source_txt, segment)

    check = verify_source_preservation(args.out_dir, pages, segments)
    write_index(args.out_dir, args.source_txt, segments, len(pages))
    write_report(args.out_dir, args.source_txt, pages, segments, check)
    write_manifest(args.out_dir, args.source_txt, segments)

    print(f"Wrote full textbook Markdown chunks to: {args.out_dir}")
    print(f"Pages with text: {len(pages)}")
    print(f"Markdown chunks: {len(segments)}")
    print(f"Source preservation check: {check['status']} ({check['matched_pages']}/{check['source_pages']} pages)")
    print(f"Index: {args.out_dir / 'textbook-000-index.md'}")
    print(f"Report: {args.out_dir / 'ocr-split-report.md'}")


if __name__ == "__main__":
    main()
