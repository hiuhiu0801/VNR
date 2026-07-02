from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

try:
    from pypdf import PdfReader
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing Python package `pypdf`. Install it with: python -m pip install pypdf"
    ) from exc


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = PROJECT_ROOT / "knowledge" / "august-1945"

DEFAULT_TEXTBOOK = Path(r"C:\Users\LENOVO\Downloads\gt-lich-su-dang-csvn-ban-tuyen-giao-tw.pdf")
DEFAULT_THEORY = Path(r"C:\Users\LENOVO\Downloads\noi_dung_ly_thuyet_cach_mang_thang_tam.pdf")
DEFAULT_SESSION_FILES = [
    Path(r"C:\Users\LENOVO\Downloads\PDF\Session 8.pdf"),
    Path(r"C:\Users\LENOVO\Downloads\PDF\Session 9.pdf"),
    Path(r"C:\Users\LENOVO\Downloads\PDF\Session 10.pdf"),
    Path(r"C:\Users\LENOVO\Downloads\PDF\Session 11.pdf"),
]


@dataclass
class ExtractedPage:
    number: int
    text: str


def parse_page_range(raw: str) -> tuple[int, int]:
    match = re.fullmatch(r"\s*(\d+)\s*-\s*(\d+)\s*", raw)
    if not match:
        raise argparse.ArgumentTypeError("Page range must look like 43-70.")

    start = int(match.group(1))
    end = int(match.group(2))
    if start <= 0 or end < start:
        raise argparse.ArgumentTypeError("Page range must be positive and ascending.")
    return start, end


def clean_text(text: str) -> str:
    text = text.replace("\ufeff", "").replace("\x00", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def paragraphize(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    blocks: list[str] = []
    current: list[str] = []

    for line in lines:
        if not line:
            if current:
                blocks.append(" ".join(current))
                current = []
            continue

        if re.fullmatch(r"\d+", line):
            continue

        current.append(line)

    if current:
        blocks.append(" ".join(current))

    return "\n\n".join(blocks).strip()


def extract_pdf_pages(path: Path, page_range: tuple[int, int] | None = None) -> list[ExtractedPage]:
    if not path.exists():
        raise FileNotFoundError(f"Missing PDF: {path}")

    reader = PdfReader(str(path))
    start = 1
    end = len(reader.pages)
    if page_range:
        start, end = page_range
        end = min(end, len(reader.pages))

    pages: list[ExtractedPage] = []
    for index in range(start - 1, end):
        raw_text = reader.pages[index].extract_text() or ""
        text = paragraphize(clean_text(raw_text))
        pages.append(ExtractedPage(number=index + 1, text=text))

    return pages


def write_markdown(
    out_path: Path,
    *,
    title: str,
    source: Path,
    source_type: str,
    pages: list[ExtractedPage],
    session: str = "",
    priority: str = "primary",
) -> list[int]:
    low_text_pages = [page.number for page in pages if len(page.text) < 80]
    page_count = len(pages)
    char_count = sum(len(page.text) for page in pages)

    frontmatter = [
        "---",
        "subject: lich-su-dang",
        'topic: "cach-mang-thang-tam-1945"',
        'period: "1940-1946"',
        f'source_type: "{source_type}"',
        f'source: "{source.name}"',
        f'priority: "{priority}"',
        'status: "extracted_text_layer"',
        f'title: "{title}"',
    ]
    if session:
        frontmatter.append(f'session: "{session}"')
    frontmatter.extend(["---", ""])

    body = [f"# {title}", ""]
    body.append(f"- Source file: `{source}`")
    body.append(f"- Extraction method: embedded PDF text layer")
    body.append(f"- Pages/slides extracted: {page_count}")
    body.append(f"- Character count: {char_count}")
    if low_text_pages:
        body.append(f"- Low-text pages to review: {', '.join(map(str, low_text_pages))}")
    body.append("")

    for page in pages:
        heading = "Slide" if session else "Trang"
        body.append(f"## {heading} {page.number}")
        body.append("")
        body.append(page.text or "[Low text page - review original PDF or OCR this page]")
        body.append("")

    out_path.write_text("\n".join(frontmatter + body).strip() + "\n", encoding="utf-8")
    return low_text_pages


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract OCR-ready Markdown for the August Revolution 1945 knowledge base."
    )
    parser.add_argument("--textbook", type=Path, default=DEFAULT_TEXTBOOK)
    parser.add_argument("--theory", type=Path, default=DEFAULT_THEORY)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument(
        "--textbook-pages",
        type=parse_page_range,
        default=parse_page_range("43-70"),
        help="1-based inclusive page range for the textbook excerpt. Default: 43-70.",
    )
    parser.add_argument(
        "--session",
        action="append",
        type=Path,
        default=None,
        help="Session PDF path. Repeatable. Defaults to Session 8-11 in Downloads/PDF.",
    )
    args = parser.parse_args()

    out_dir: Path = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    report: list[str] = [
        "# OCR/extraction report",
        "",
        "The PDFs currently contain extractable text layers. Pages listed below still deserve visual review because they produced little text.",
        "",
    ]

    textbook_pages = extract_pdf_pages(args.textbook, args.textbook_pages)
    low = write_markdown(
        out_dir / "textbook-lich-su-dang-cach-mang-thang-tam-1940-1946.md",
        title="Giáo trình Lịch sử Đảng CSVN - trích đoạn Cách mạng Tháng Tám 1940-1946",
        source=args.textbook,
        source_type="textbook_excerpt",
        pages=textbook_pages,
        priority="primary",
    )
    report.append(f"- Textbook excerpt `{args.textbook.name}`: {len(textbook_pages)} pages, low-text pages: {low or 'none'}")

    theory_pages = extract_pdf_pages(args.theory)
    low = write_markdown(
        out_dir / "theory-cach-mang-thang-tam-1945.md",
        title="Nội dung lý thuyết Cách mạng Tháng Tám và bảo vệ chính quyền non trẻ",
        source=args.theory,
        source_type="theory_pdf",
        pages=theory_pages,
        priority="primary",
    )
    report.append(f"- Theory PDF `{args.theory.name}`: {len(theory_pages)} pages, low-text pages: {low or 'none'}")

    session_files = args.session if args.session else DEFAULT_SESSION_FILES
    for session_file in session_files:
        match = re.search(r"Session\s+(\d+)", session_file.stem, flags=re.IGNORECASE)
        session_number = match.group(1) if match else session_file.stem
        session_pages = extract_pdf_pages(session_file)
        low = write_markdown(
            out_dir / f"session-{int(session_number):02d}-cach-mang-thang-tam.md",
            title=f"Session {session_number} - Cách mạng Tháng Tám 1945",
            source=session_file,
            source_type="session_slide_pdf",
            pages=session_pages,
            session=session_number,
            priority="primary",
        )
        report.append(f"- Session {session_number} `{session_file.name}`: {len(session_pages)} slides, low-text pages: {low or 'none'}")

    report_path = out_dir / "ocr-extraction-report.md"
    report_path.write_text("\n".join(report).strip() + "\n", encoding="utf-8")

    print(f"Wrote August 1945 knowledge files to: {out_dir}")
    for path in sorted(out_dir.glob("*.md")):
        print(f"{path.name}: {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
