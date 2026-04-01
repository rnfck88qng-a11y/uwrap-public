package uwrap

allowed_sources := {"uLab", "ci", "benchmark-runner"}

deny[msg] {
  not allowed_sources[input.manifest.source]
  msg := sprintf("source not allowed: %v", [input.manifest.source])
}
