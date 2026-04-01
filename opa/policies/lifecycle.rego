package uwrap

# Require specific lifecycle state
deny[msg] {
  input.manifest.lifecycle_state != "VERIFIED"
  msg := "wrap must be VERIFIED"
}
