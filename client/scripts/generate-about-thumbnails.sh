#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="public/videos"
OUTPUT_DIR="${SOURCE_DIR}/thumbnails"

mkdir -p "${OUTPUT_DIR}"

capture_frame() {
  local input="$1"
  local output="$2"

  ffmpeg -y -ss 0.5 -i "${input}" -frames:v 1 -q:v 2 -update 1 "${output}"
}

capture_frame "${SOURCE_DIR}/intro.mp4" "${OUTPUT_DIR}/intro.jpg"
capture_frame "${SOURCE_DIR}/team-member-1.mp4" "${OUTPUT_DIR}/team-member-1.jpg"
capture_frame "${SOURCE_DIR}/team-member-2.mp4" "${OUTPUT_DIR}/team-member-2.jpg"
capture_frame "${SOURCE_DIR}/team-member-3.mp4" "${OUTPUT_DIR}/team-member-3.jpg"
capture_frame "${SOURCE_DIR}/team-member-4.mp4" "${OUTPUT_DIR}/team-member-4.jpg"
