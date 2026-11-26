"""Create portable source and upload archives from a freshly built dist directory."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib, json, sys

base = Path(__file__).resolve().parent
dist = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else base / "dist"
if not (dist / "guide.html").is_file():
    raise SystemExit("Run node build.mjs first")

source = [p for p in base.iterdir() if p.is_file() and
          (p.suffix in {".js", ".mjs", ".css", ".svg", ".ico", ".png"} or p.name.endswith(".body.html")
           or p.name in {"README.md", "package.py", "element-map.csv"})]
source += sorted((base / "social").glob("*.png"))
source += sorted((base / "artwork").glob("*.*"))
source += sorted((base / "docs" / "screenshots").glob("*.webp"))
source += [p for p in (base / "fonts").iterdir() if p.is_file()]
with ZipFile(dist / "solod-ui-kit-source.zip", "w") as archive:
    for file in sorted(source):
        entry = ZipInfo("solod-ui-kit/" + file.relative_to(base).as_posix(), (2026, 11, 24, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        archive.writestr(entry, file.read_bytes())
manifest = {p.relative_to(dist).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(dist.rglob("*")) if p.is_file() and p.name != "manifest.json"}
(dist / "manifest.json").write_text(json.dumps({"version":"2.1.0","files":manifest}, indent=2) + "\n", encoding="utf-8")
print(f"{len(source)} source files, {len(manifest)} published payloads")
