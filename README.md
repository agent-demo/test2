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

## /** FEATURES **/
  1. Able to add tasks. (toradora -a "The task I want to add")
  2. Able to complete those tasks. (toradora -c 1 )
  3. Able to edit those tasks. (toradora -e 1 "The previous task edited")
  4. Able to manifest those tasks. (toradora)
 > ===============================
 
 > |>>> Today's Task <<<
 
 > |1. "task one"
 
 > |2. "task two"
 
 > |>>> Backlogs <<<
 
 > |3. "task three"
 
 > |===============================

  5. Able to manifest all the tasks in database. (toradora -z)

## Notes

The DB is currently stored at `~/.toradora.db`
