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

### [2026-11-23] Stale TSX Buffer and Missing tsconfig.json in VS Code Problems Panel
- **Symptom:** VS Code's Problems panel reported 8 errors: 6 module resolution errors on `src/app/index.tsx` (`@/components/...`) and 2 config errors on `tsconfig.json` (`No inputs found`, `expo/tsconfig.base not found`).
- **Root Cause:** When `create-expo-app` generated the project, default TypeScript template files (`src/app/index.tsx`, `tsconfig.json`) were opened in VS Code editor tabs. When boilerplate files were purged to implement the JavaScript MVVM architecture, the open editor tab in VS Code remained in-memory as an unsaved/stale buffer. The TypeScript language server in VS Code continued evaluating the in-memory `.tsx` buffer and searched for the deleted `tsconfig.json`. Neither file existed on disk.
- **Fix:** Added `jsconfig.json` configuring VS Code explicitly for a JavaScript / React Native project, and instructed closing the stale, deleted `index.tsx` editor tab.
- **Prevention:** After deleting or restructuring template files, close any open editor tabs in VS Code and reload the window (`Ctrl+Shift+P` -> `Developer: Reload Window`).

### [2026-11-23] Git Network Failure: Could Not Resolve Host (github.com)
- **Symptom:** VS Code Git output logged `fatal: unable to access 'https://github.com/shamikaakash120-cmd/healthmate.git/': Could not resolve host: github.com` during `git pull --tags origin main`.
- **Root Cause:** A momentary drop in internet connectivity or temporary DNS resolution failure on the client machine when Git attempted to query GitHub.
- **Fix:** Tested and confirmed DNS resolution to `github.com` (IP: `20.247.166.64`) and verified remote connection with `git ls-remote`. Network connectivity is restored.
- **Prevention:** For transient DNS interruptions, verify network connection or flush DNS cache with `ipconfig /flushdns` before re-syncing.

### [2026-11-23] Expo SQLite Web Worker WASM Resolution
- **Symptom:** Metro bundler failed during web export with `Unable to resolve "./wa-sqlite/wa-sqlite.wasm" from "node_modules/expo-sqlite/web/worker.ts"`.
- **Root Cause:** Metro's default asset configuration does not include `.wasm` files in `resolver.assetExts`, preventing `expo-sqlite`'s web worker from resolving its WebAssembly database binary.
- **Fix:** Created `metro.config.js` appending `'wasm'` to `config.resolver.assetExts`.
- **Prevention:** Always include wasm asset extension support in Metro when using `expo-sqlite` with multi-platform / web capabilities.
