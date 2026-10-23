# Approved implementation plan — Kodeverkstad Skule

The human approved a separate Nynorsk school platform for grades 8–10: a common beginner start, eight open modules, optional support levels, visual JavaScript, website creation, a complete Snake course, Google school accounts, server autosave and a teacher view for approved groups.

## Task 1: execution foundation

Build the light creative workshop using Vite, CodeMirror and QuickJS in a worker. Prove drawing, animation and restricted DOM interactions. Student code cannot reach network, credentials or host storage. Validate messages, enforce resource bounds and cancel stale runs.

## Task 2: data and identity

Express, Google Identity Services, Firestore. Versioned progress/projects, revision conflicts preserving both copies, server-authorized groups/memberships, separately assigned teachers, logout/account separation. Local development uses synthetic accounts and the Firestore emulator.

## Task 3: curriculum and interface

50 lessons, distributed 6/6/6/8/6/6/8/4 across getting started, pixel art, animation, HTML/CSS, interactive sites, small games, Snake, independent projects. Each includes goal, explanation/glossary, example, starter, hints, solution/explanation, extension. Support changes do not overwrite work. Snake shares one project. Distinguish automatic checks, self checks and teacher review. Export working project files.

## Task 4: verification and handover

Unit/integration, build and browser tests; emulator backup/restore; 10 simultaneous users; alternative solutions, timeouts/memory, auth boundaries, conflicts, network failure, keyboard/contrast/zoom/reduced motion and complete Snake. Final fresh independent review. Deliver local runnable software and municipality deployment instructions.

## External acceptance gates

Live Google identities/domains, Google Cloud project/billing, region, retention/deletion and operator ownership must be supplied by the municipality before school use. Classroom testing and actual school machine testing remain external acceptance. No deploy or public student gallery in this implementation. Stickman and AI chat are later extensions.

## Review focus

Untrusted student input across QuickJS/DOM/HTML bridges; account switches with pending saves; concurrent revisions; teacher membership authorization; production/local mode boundaries; consistency between exported and in-app project behavior; all 50 lessons and cumulative Snake progression.
