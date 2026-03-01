#!/bin/bash
# Claude Skills Installer
# Symlinks skills from this repo into ~/.claude/skills/ for global availability

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/.claude/skills"
TARGET_DIR="$HOME/.claude/skills"

if [ ! -d "$SKILLS_DIR" ]; then
  echo "Error: No skills directory found at $SKILLS_DIR"
  exit 1
fi

mkdir -p "$TARGET_DIR"

echo "Installing Claude Skills..."
echo ""

count=0
for skill in "$SKILLS_DIR"/*/; do
  if [ -f "$skill/SKILL.md" ]; then
    name=$(basename "$skill")
    ln -sfn "$skill" "$TARGET_DIR/$name"
    echo "  Installed: $name"
    count=$((count + 1))
  fi
done

echo ""
echo "Done. $count skills installed to $TARGET_DIR"
echo ""
echo "Skills are now available in all Claude Code sessions."
echo "Invoke with /skill-name or let Claude auto-detect them."
