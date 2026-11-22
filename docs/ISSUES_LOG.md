# HealthMate - Issues Log

This log records every error, issue, or unexpected behavior encountered during development, along with its root cause and the fix applied.

---

## Log Template
### [YYYY-MM-DD] Issue Title
- **Symptom:** Description of the error or unexpected behavior.
- **Root Cause:** Explanation of why it occurred.
- **Fix:** Step-by-step resolution applied.
- **Prevention:** Best practices to prevent recurrence.

---

### [2026-11-21] Network Restriction in Sandbox during Project Init
- **Symptom:** `npx create-expo-app` failed with `ENOTFOUND registry.npmjs.org`.
- **Root Cause:** Standard Sandbox execution isolates network access.
- **Fix:** Ran initialization and package installation with explicit network approval.
- **Prevention:** Execute all offline file/build commands inside sandbox and limit network-dependent commands to package installations.

### [2026-11-21] Non-Empty Directory Conflict on Create-Expo
- **Symptom:** `create-expo` refused to initialize in the project folder due to existing files.
- **Root Cause:** Initial repo contained default repository files (`README.md`).
- **Fix:** Temporarily backed up `README.md`, initialized Expo project with default template, and restored project documentation.
- **Prevention:** Initialize new templates in clean workspaces or handle pre-existing repository artifacts before templating.
