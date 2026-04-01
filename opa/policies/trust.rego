package uwrap

# Require wrap passes validator
deny[msg] {
  not input.validator.valid
  msg := "wrap must pass validator"
}

# Require verified signature for trusted lane
deny[msg] {
  input.signature.present
  not input.signature.verified
  msg := "signature present but not verified"
}

deny[msg] {
  input.require_trusted
  not input.signature.verified
  msg := "trusted lane requires verified signature"
}
