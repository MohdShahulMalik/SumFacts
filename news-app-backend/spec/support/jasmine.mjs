export default {
  spec_dir: "test",
  spec_files: [
    "**/*[tT]est.ts"
  ],
  helpers: [
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}