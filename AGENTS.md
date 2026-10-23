# Kodeverkstad Skule

The owner resumed work on 2026-10-22 with **Iverksett videre arbeid**. The 2026-10-21 pause is lifted. Read `docs/RESUME.md` for the current handover and next step. Resume authorization is not production deployment approval.

Nynorsk school learning platform, separate from the personal Javascript/Kodeverkstad repository. Never modify the personal app or its learning data.

Keep stable school lesson IDs and versioned records. Student JavaScript runs only inside QuickJS in a Web Worker. Never evaluate student scripts in the host JavaScript engine. All access to student records is authorized by the server. Production must fail closed without Google/Firestore configuration; local test accounts are loopback-only.

Checks: pnpm test, pnpm build, pnpm test:e2e, pnpm test:emulator. Real school accounts, students, devices and Cloud deployment require the municipality's configuration and acceptance; automated evidence is not classroom acceptance.
