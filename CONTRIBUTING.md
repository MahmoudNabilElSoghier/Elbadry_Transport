# Contributing & Commit Rules

Short, binding workflow rules for anyone (human or AI) working in this repo.
Adopted after the `Elbadry_Transport.txt` incident, in which a credentials
file was swept into a public commit by a bulk `git add -A`.

## 1. Staging

- **NEVER** run `git add -A` or `git add .` — stage **named file paths only**
  (e.g. `git add index.html js/lang.js`).
- Before every commit, print the list of files to be staged and the total
  line diff.
- If any file is **NOT** one of `*.html`, `*.css`, `*.js`, `*.md`, `*.svg`,
  `*.xml`, `*.txt` (only `README`/`robots`), `LICENSE` — **wait for the
  maintainer's explicit approval** before staging it.

## 2. Pushing

Before every push, print:
1. the branch,
2. the number of commits ahead of the remote,
3. the full list of files changed since the last push.

## 3. Secret tripwire

If `git status` shows **any** file matching the secret patterns in
`.gitignore` (`*password*`, `*credential*`, `*secret*`, `*.key`, `*.pem`,
`*.env`, `secrets.json`, `config.local.*`, stray `*.txt`/docs) —
**STOP and report. Do not stage it.** See `.gitignore` for the full list.

## 4. Credentials policy

Secrets live **outside** this repo, always. Never commit passwords, API
tokens, mailbox credentials, or hosting logins — not even "temporarily".
