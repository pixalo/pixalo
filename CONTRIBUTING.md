Thank you for contributing to **Pixalo**!  
This guide helps developers understand how to collaborate, structure changes, and submit pull requests properly.

---

## 🧭 General Principles
- Pixalo is a lightweight and high-performance **2D game engine**. Every line of code must be purposeful, clean, and efficient.  
- Collaboration should always be respectful and professional. Please use **Issues** and **Discussions** on GitHub for communication.  
- If you plan to introduce major architectural changes, open a discussion before making any pull request.

---

## 🔀 Branching & Contribution Flow

- The **main** branch represents the stable release version.  
- Each developer must **fork** the repository and create a new branch named **`development`** in their fork.  
- All edits and new features should be implemented on the `development` branch.  
- Once ready, submit a **Pull Request (PR)** from your `development` branch to **`pixalo/main`**.  
- Direct commits or PRs to `main` are not accepted. Only reviewed and approved merges from `development` are allowed.

```bash
# 1. Fork the repository from GitHub (via web interface)

# 2. Clone your fork
git clone https://github.com/<your-username>/pixalo.git
cd pixalo

# 3. Add the original Pixalo repo as upstream
git remote add upstream https://github.com/pixalo/pixalo.git

# 4. Create and switch to your development branch
git checkout -b development

# 5. Make your changes, commit them
git add .
git commit -m "feat: improve camera performance"

# 6. Push your branch to your fork
git push origin development

# 7. Open a Pull Request from your fork's 'development' branch
#    → target: pixalo/main
```

---

## 🧩 Testing Changes

There are **no npm-based test commands** at this time.  
Developers must verify their changes **by running and testing the examples inside the `examples/` folder**.  
Ensure that all example projects run correctly, frame rates remain stable, and no regressions are introduced.

---

## 📘 Documentation Structure

Documentation is versioned and organized as follows:

```
wiki/
  v1/
    *.md
    CHANGELOG.md
  v2/
    *.md
    CHANGELOG.md
  ...
```

- While the project is in a specific **major version** (e.g., `v1`), only that version’s documentation may be modified.  
- All updates must be recorded in the corresponding `CHANGELOG.md` file (e.g., `v1.1.0`).  
- When a new major version is released (e.g., `v2`), a new folder structure will be created for it.

---

## 🧱 Code Style & Rules

The **Pixalo** development team is highly strict about code quality, readability, and optimization.  
All code must:
- Follow the same structural and documentation style as existing Pixalo source code.  
- Be grouped and labeled with clear comment blocks, for example:

```js
/** ======== LOGS ======== */
log (...args) { }
info (...args) { }
warn (...args) { }
error (...args) { }
/** ======== END ======== */
```

> These conventions are **mandatory**.  
> Any pull request that fails to follow them will be rejected.

---

## 🧠 Project Philosophy

Pixalo was built to be a **fast, lightweight, and scalable 2D game engine**.  
Every contribution must serve that purpose — improving performance, structure, or developer experience.

---

## 🧾 Reporting Bugs & Requesting Features

- Use **Issues** to report bugs — include your browser, OS, engine version, reproduction steps, and relevant console logs.  
- For new feature ideas, open an issue with the `enhancement` label and explain the motivation and potential API.  
- For general questions or coordination, use **Discussions**.

---

## ⚖️ Rights & Licensing

All contributors are part of the **Pixalo Development Team**.  
Every code or documentation change you submit will be **credited under your name** in the project history.  
The overall project ownership, branding, and core direction belong to the Pixalo team.

---

## 🎉 Final Words

Welcome to the hardworking and talented **Pixalo Team**!  
Every commit, idea, and contribution moves this engine forward.  
Code clean, test thoroughly, and keep Pixalo blazing fast 🚀