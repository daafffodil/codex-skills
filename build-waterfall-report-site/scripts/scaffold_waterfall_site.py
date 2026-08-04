from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create a minimal waterfall report site from the bundled starter."
    )
    parser.add_argument("output", type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--mode", choices=("dated", "collection"), default="dated")
    parser.add_argument("--accent", default="#23B985")
    parser.add_argument(
        "--brand",
        choices=("none", "dangdang"),
        default="none",
        help="Use a brand asset bundled with the skill.",
    )
    parser.add_argument("--brand-mark", type=Path)
    return parser.parse_args()


def validate_hex_color(value: str) -> str:
    if len(value) != 7 or not value.startswith("#"):
        raise ValueError("accent must use #RRGGBB")
    int(value[1:], 16)
    return value.upper()


def main() -> None:
    args = parse_args()
    output = args.output.resolve()
    if output.exists() and any(output.iterdir()):
        raise FileExistsError(f"Refusing to write into non-empty directory: {output}")

    skill_root = Path(__file__).resolve().parents[1]
    starter = skill_root / "assets" / "starter"
    output.mkdir(parents=True, exist_ok=True)
    shutil.copytree(starter, output, dirs_exist_ok=True)

    manifest_path = output / "data" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["site"]["title"] = args.title
    manifest["site"]["mode"] = args.mode
    manifest["site"]["accent"] = validate_hex_color(args.accent)

    if args.brand != "none" and args.brand_mark:
        raise ValueError("--brand and --brand-mark cannot be used together")

    source = None
    if args.brand == "dangdang":
        source = skill_root / "assets" / "brands" / "dangdang-brand-mark.png"
    elif args.brand_mark:
        source = args.brand_mark.resolve()

    if source:
        if not source.is_file():
            raise FileNotFoundError(f"brand mark not found: {source}")
        suffix = source.suffix.lower() or ".png"
        target = output / "assets" / f"brand-mark{suffix}"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        manifest["site"]["brandMark"] = target.relative_to(output).as_posix()

    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()
