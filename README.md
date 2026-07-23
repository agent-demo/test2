# toradora - A terminal based todo list

## Getting started

**Requirements**

1. sqlite library
2. make
3. gcc/clang

**Compiling**

```bash
make
```

**Installing**

```bash
make install
```

**Uninstalling**

``` bash
make uninstall
```

## Features

  1. Add tasks. `toradora -a "The task I want to add"`
  2. Add tasks with priority. `toradora -a "urgent fix" -p 1`
  3. Add daily tasks (always shown). `toradora -d "morning run"`
  4. Add daily tasks with priority. `toradora -d "read" -p 1`
  5. Complete tasks. `toradora -c 1`
  6. Edit tasks. `toradora -e 1 "The previous task edited"`
  7. Manifest tasks. `toradora`

```
----------------------------------------------
>>> Daily <<<
  [!] 2. read for 30 mins
  [~] 1. morning run

>>> Today's Tasks <<<
  [!] 3. fix the login bug
  [~] 4. write tests
  [ ] 5. update docs

>>> Backlog <<<
  [~] 6. old task from yesterday
----------------------------------------------
```

  8. Show all tasks ever recorded. `toradora -z`

## Priority Levels

| Flag  | Symbol | Meaning |
|-------|--------|---------|
| `-p 1` | `[!]`  | High    |
| `-p 2` | `[~]`  | Medium (default) |
| `-p 3` | `[ ]`  | Low     |

## Notes

The DB is currently stored at `~/.toradora.db`

New columns (`priority`, `daily`) are automatically added to existing databases on first run.
