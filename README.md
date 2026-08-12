# GDG GLAU OSS applicant tasks

Welcome! This repository is a small practice space for GDG GLAU club applicants who want to make their first open-source contribution. The Toradora todo list is implemented in several styles so you can choose a track that matches your current comfort level.

## Tracks

| Track | What you will practice | Start here |
| --- | --- | --- |
| C | SQLite, a terminal program, and a native build | [`todo/c/`](todo/c/) |
| Python | `argparse`, the `sqlite3` standard library, and reusable application logic | [`todo/python/`](todo/python/) |
| Vanilla JavaScript | DOM events, client-side rendering, and `localStorage` | [`todo/js/`](todo/js/) |
| Flask | Python web routes, Jinja templates, and server-side rendering | [`todo/flask/`](todo/flask/) |

The [`apps/calculator/`](apps/calculator/) project is an optional warm-up if you are brand new to HTML, CSS, or JavaScript.

Each track has its own setup guide and a list of small good-first issues. You do not need to complete every track.

## Pick a track

Choose whichever track matches your comfort level. It is completely fine to start with the Python or calculator track, and it is also fine to choose a more advanced track if you already know the tools. If you notice a useful improvement that is not listed, open an issue describing it before starting. Finding and proposing your own small improvement is a bonus signal.

## First contribution workflow

1. Fork this repository on GitHub.
2. Clone your fork and enter the repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/toradora.git
   cd toradora
   ```

3. Create a branch with a short name for your change:

   ```bash
   git switch -c fix-python-help-text
   ```

4. Read the README for your chosen track, make one focused change, and test it locally.
5. Review your changes, then commit them with a clear message:

   ```bash
   git status
   git add todo/python
   git commit -m "Improve Python CLI help text"
   ```

6. Push the branch to your fork and open a pull request against this repository:

   ```bash
   git push -u origin fix-python-help-text
   ```

In the pull request description, explain what changed, how you tested it, and link the issue if there is one. Keep pull requests small and focused. If something is unclear, ask in the issue or pull request — asking a good question is part of contributing.

## Advice

We're testing your understanding of the contribution workflow, not judging which project you picked. It doesn't matter whether you touch the C, Python, JS, or Flask track, what matters is that you follow the proper procedure and make a meaningful change that actually improves the application, not a cosmetic one.

Using AI tools while working is not strictly prohibited, but we will reject any PR that is substantially AI-written. We have a model trained on a large volume of AI-generated code and it detects this reliably, so don't rely on it going unnoticed.

Prefer multiple small, focused PRs over one large one. It's easier for us to review, easier for you to explain, and easier to recover from if something needs to change. Set up the original repository as an `upstream` remote and sync regularly so you don't run into painful merge conflicts:

```bash
git remote add upstream https://github.com/agent-demo/toradora.git
git fetch upstream
git rebase upstream/main
```

If you get stuck, check the relevant track's README first, then the official docs for the tool you're using. If it's still unclear or you think something in the repo itself is wrong or missing, open a discussion or issue rather than guessing silently, we'd rather answer a question than get a confused PR.

Explore the repo on your own before you touch anything. Read the code, understand what it's doing, and then write a PR that matches your actual skill level. We'd rather see a small, well-understood change than a large one you can't explain.

## C build

The original C implementation is under `todo/c/`:

```bash
make
./todo/c/toradora -h
```

You need a C compiler, `make`, and the SQLite development library. The database is stored at `~/.toradora.db` by default.

## Advanced Track — Real Projects

Want to skip the toy project and build something with sharper edges? Pick a real repository, read its README, and open an issue with a small, concrete proposal before you begin. These are not applicant exercises; they are projects with real design constraints.

- **[sush — Simple User Shell](https://github.com/souls-syntax/sush)** — A C++ shell built from scratch: lexer, expansion, parser, pipelines, redirection, and process execution. For people who want to understand what happens between pressing Enter and a program running. *Difficulty: advanced · currently on hiatus.*

- **[soft-cuda](https://github.com/builders-lab/soft-cuda)** — A from-scratch C++/CUDA tensor and autograd engine with CPU, GPU, and hybrid execution. Tensors, kernels, computation graphs, and benchmarking—close to the metal. *Difficulty: advanced.*

- **[sauceOS](https://github.com/souls-syntax/sauceOS)** — A lightweight Unix-like x86_64 OS in C and assembly, booted with Limine. Kernel work with interrupts, memory, drivers, and ambitious future experiments. *Difficulty: advanced · currently on hiatus.*

- **[Wrench](https://github.com/souls-syntax/Wrench)** — A small Go agent loop that lets local or OpenAI-compatible LLMs read files, write files, and run confirmed shell commands. A compact place to learn tool use and practical agent safety. *Difficulty: intermediate.*

- **[reader.cpp](https://github.com/souls-syntax/reader.cpp)** — A terminal RSVP (Rapid Serial Visual Presentation) reader: give it a file and watch words arrive at your chosen pace. Small surface area, pleasantly focused systems/C++ work. *Difficulty: intermediate.*

- **[elf-parser / tsundere-runtime](https://github.com/souls-syntax/elf-parser)** — A Zig userspace runtime for loading and executing a compact ELF-derived binary format, complete with memory mapping, section parsing, and a tiny SDK. Strange binaries, custom loaders, excellent rabbit hole. *Difficulty: advanced.*

- **[C-STL](https://github.com/souls-syntax/C-STL)** — A C data-structure library with dynamic arrays and linked lists. The challenge here is deliberately difficult: implement a well-tested AVL tree or red-black tree in C, with a clean API and documentation. *Difficulty: advanced—DSA is supposed to hurt a little.*

- **[MNEMOSYNE](https://github.com/Maris-CHALDEAS/MNEMOSYNE)** — A browser-based, Chaldea-themed visual-novel experience with typewriter dialogue, branching choices, affinity, and multiple endings. Built for vibes; a great home for creative frontend contributions. *Difficulty: intermediate.*

## Credits

The source code for `apps/calculator` was provided by [Utkarsh-1771](https://github.com/Utkarsh-1771/).

## License

It's a bit of a mix, so here's the breakdown:

- `todo/c/toradora.c` (the original C implementation) is licensed under **AGPL-3.0**.
- `apps/calculator/` is licensed under **MIT**, per the original author.
- Everything else in this repository was scaffolded by me and is licensed under **BSD-2-Clause**.

If you're unsure which license applies to a file you're touching, check the folder it's in or ask in your PR.