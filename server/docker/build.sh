#!/usr/bin/env bash
# Builds all codesync runner images.
# Place this file in: codesync/server/docker/
 
set -e
cd "$(dirname "$0")"
 
build() {
  local dir="$1"; shift
  if [ -d "$dir" ]; then
    echo "==> Building $dir ($*)"
    (cd "$dir" && docker build "$@" .)
  else
    echo "==> Skipping $dir (directory not found)"
  fi
}
 
build cpp        -t codesync-cpp
build c          -t codesync-c
build javascript -t codesync-js
build java       -t codesync-java
build python     -t codesync-python
 
echo "All builds finished."
