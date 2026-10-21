# Execution ledger — plan: docs/PLAN.md

Baseline: 9162365, new independent clone on codex/kodeverkstad-skule. Original personal repository is clean and will not be modified.

Pre-flight: curriculum consumes the runtime drawing/DOM protocol and checker; UI consumes server progress/project revisions; teacher reads reuse authorization. Define these interfaces before dependent content.

Ruling: use this explicitly requested separate clone as the isolated workspace; use this durable ledger for the conversational plan (which has no machine-generated task briefs). No extra worktree or scratch-script machinery is necessary. Cost if wrong: bookkeeping layout only.

Task 1: complete. Runtime tests observed RED then GREEN (5/5); preview sanitization RED then GREEN (2/2). Representative drawing, animation and DOM interactions also pass in Chrome. QuickJS runs only in Workers, including offline exports.

Task 2: complete. API tests observed RED then GREEN (6/6), save-queue/configuration RED then GREEN (3/3). Local Firestore emulator export/restore and overwrite refusal PASS. Real Google credentials and municipality configuration remain external gates.

Task 3: complete. Eight modules and 50 lessons authored; schema/content and all 50 reference solutions PASS. Browser suite 9/9 PASS: beginner path, DOM isolation, support/reset/offline recovery, two-session conflict, account clearing, infinite loop recovery, full Snake and standalone ZIP, teacher approval/feedback, axe accessibility/keyboard/narrow/reduced-motion checks. Screenshots inspected at desktop and narrow layout.

Task 4: in progress. Add alternative-answer/load coverage, operational handover, final independent review and final verification.

Task 4 implementation checks: complete. pnpm test 74/74 PASS; pnpm test:e2e 11/11 PASS including ten simultaneous Chrome/Firestore sessions; pnpm build PASS; pnpm test:preview 2/2 PASS using built files; pnpm test:emulator PASS. Deployment and actual classroom checks remain explicitly NOT_RUN in docs/VERIFICATION.md. Final independent review pending.

Final independent review: completed on ed20e108 by one fresh reviewer. Five findings accepted after impact re-grading: one P1 conflict-data loss, four P2 ordinary-use failures (HTML keys, nested clicks, export presentation, expired-session recovery). All addressed in one combined fix pass with failing then passing regressions. No minor findings deferred. Declined-to-judge rulings and costs are recorded in docs/REVIEW.md; all municipal and physical acceptance gates remain open. Author final validation is in progress; no second independent review is claimed.

Owner-requested pause, 2026-10-21: code fixes complete; final pnpm test 80/80 PASS, pnpm test:e2e 16/16 PASS, pnpm build PASS, pnpm test:emulator PASS. test:preview passed 2/2 before the review fixes and has not been rerun; this is the next local verification on resume. A repeated test fixture was corrected to actually change persisted code; the subsequent full browser suite passed. No new product work or cloud operations during the pause. Resume only on owner message **iverksett**. See docs/RESUME.md. Both helper agents completed; no other active project thread found.

Additional regression evidence: event-callback error reporting RED→GREEN; teacher allowlist revocation for existing sessions RED→GREEN; logout with another tab's offline draft RED→GREEN; queued input during QuickJS initialization RED→GREEN. School lesson IDs are explicitly namespaced skule-v1- and do not reuse personal lesson IDs.

Implementation evidence: initial browser failure exposed accessible run-button naming and was corrected; all nine browser paths subsequently passed. Java and Firestore emulator are checksum-verified portable downloads in ignored .local/tools; no system settings changed. First extraction method was unavailable on Windows PowerShell, so the setup uses the existing fflate ZIP library with path containment checks.
