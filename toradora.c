/* toradora.c - A terminal based todo list */
/* Using a sqlite database at ~/.toradora.db we will keep track of all the
 * entries */

/** FEATURES **/
/*
 * 1. Able to add tasks. (toradora -a "The task I want to add")
 * 2. Able to complete those tasks. (toradora -c 1 )
 * 3. Able to edit those tasks. (toradora -e 1 "The previous task edited")
 * 4. Able to manifest those tasks. (toradora)
 * ===============================
 * >>> Daily <<<
 * [!] 1. "daily habit"
 *
 * >>> Today's Task <<<
 * [!] 2. "high priority task"
 * [~] 3. "normal task"
 *
 * >>> Backlog <<<
 * [ ] 4. "old task"
 * ===============================
 * 5. Able to manifest all the tasks in database. (toradora -z)
 * 6. Able to add a daily task. (toradora -d "daily habit")
 * 7. Able to add a task with priority. (toradora -a "task" -p <1|2|3>)
 *    Priority: 1 = high [!], 2 = medium [~], 3 = low [ ]
 *
 */

#include <sqlite3.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define VERSION "0.2.0"

#define MAX_PATH_LENGTH 4096

/* Priority levels */
#define PRIORITY_HIGH   1
#define PRIORITY_MEDIUM 2
#define PRIORITY_LOW    3

static const char *
priority_label(int priority)
{
    switch (priority) {
    case PRIORITY_HIGH:   return "[!]";
    case PRIORITY_MEDIUM: return "[~]";
    case PRIORITY_LOW:    return "[ ]";
    default:              return "[~]";
    }
}

static void
manifest_usage()
{
    printf("toradora - a terminal based todo list\n\n");
    printf("Usage:\n");
    printf("  toradora                          Show today's tasks and backlog\n");
    printf("  toradora -z                       Show all tasks ever recorded\n");
    printf("  toradora -a \"task\"                Add a new task\n");
    printf("  toradora -a \"task\" -p <1|2|3>     Add a task with priority (1=high, 2=medium, 3=low)\n");
    printf("  toradora -d \"task\"                Add a daily task (always shown)\n");
    printf("  toradora -c <id>                  Mark task <id> as complete\n");
    printf("  toradora -e <id> \"new task\"       Edit task <id>\n\n");
    printf("Priority levels:\n");
    printf("  1 = [!] High\n");
    printf("  2 = [~] Medium (default)\n");
    printf("  3 = [ ] Low\n\n");
    printf("Examples:\n");
    printf("  toradora -a \"write usage function\"\n");
    printf("  toradora -a \"urgent fix\" -p 1\n");
    printf("  toradora -d \"morning run\"\n");
    printf("  toradora -c 3\n");
    printf("  toradora -e 3 \"write usage function (done)\"\n");
}

/* Callback for displaying tasks with priority label */
static int
callback_manifest(void *data, int argc, char **argv, char **az_col_name)
{
    (void)data;
    (void)az_col_name;
    /* argv[0] = id, argv[1] = task, argv[2] = priority */
    int priority = PRIORITY_MEDIUM;
    if (argc >= 3 && argv[2] != NULL) {
        priority = atoi(argv[2]);
    }
    printf("  %s %s. %s\n", priority_label(priority), argv[0], argv[1]);
    return 0;
}

static void
manifest_active_tasks(sqlite3 *DB)
{
    int query_status;
    char *message_error_1;
    char *message_error_2;
    char *message_error_3;

    printf("----------------------------------------------\n");

    /* Daily tasks */
    printf(">>> Daily <<<\n");
    char *manifest_query_daily = "SELECT id, task, priority FROM tasks "
        "WHERE status = 0 AND daily = 1 ORDER BY priority ASC;";
    query_status = sqlite3_exec(DB, manifest_query_daily, callback_manifest, NULL, &message_error_1);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("%s\n", message_error_1);
        printf("[Help]: Check database sanity\n");
        return;
    }

    /* Today's tasks (non-daily, created today) */
    printf("\n>>> Today's Tasks <<<\n");
    char *manifest_query_today = "SELECT id, task, priority FROM tasks "
        "WHERE status = 0 AND daily = 0 AND created_at = CURRENT_DATE "
        "ORDER BY priority ASC;";
    query_status = sqlite3_exec(DB, manifest_query_today, callback_manifest, NULL, &message_error_2);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("%s\n", message_error_2);
        printf("[Help]: Check database sanity\n");
        return;
    }

    /* Backlog (non-daily, created before today) */
    printf("\n>>> Backlog <<<\n");
    char *manifest_query_backlog = "SELECT id, task, priority FROM tasks "
        "WHERE status = 0 AND daily = 0 AND created_at != CURRENT_DATE "
        "ORDER BY priority ASC;";
    query_status = sqlite3_exec(DB, manifest_query_backlog, callback_manifest, NULL, &message_error_3);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("%s\n", message_error_3);
        printf("[Help]: Check database sanity\n");
        return;
    }

    printf("----------------------------------------------\n");
}

static void
manifest_all_tasks(sqlite3 *DB)
{
    int query_status;
    char *message_error;
    printf("----------------------------------------------\n");
    printf(">>> All tasks ever recorded <<<\n");
    char *manifest_query = "SELECT id, task, priority FROM tasks ORDER BY priority ASC;";
    query_status = sqlite3_exec(DB, manifest_query, callback_manifest, NULL, &message_error);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("%s\n", message_error);
        printf("[Help]: Check database sanity\n");
        return;
    }
    printf("----------------------------------------------\n");
}

static void
toradora_add_task(sqlite3 *DB, const char *todo, int priority)
{
    sqlite3_stmt *stmt = NULL;
    int query_status;

    const char *add_query = "INSERT INTO tasks (task, priority) VALUES (?, ?);";

    query_status = sqlite3_prepare_v2(DB, add_query, -1, &stmt, NULL);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }

    sqlite3_bind_text(stmt, 1, todo, -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 2, priority);
    query_status = sqlite3_step(stmt);
    if (query_status != SQLITE_DONE) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    printf("[Info]: Task added with priority %s\n", priority_label(priority));
    error:
    sqlite3_finalize(stmt);
}

static void
toradora_add_daily_task(sqlite3 *DB, const char *todo, int priority)
{
    sqlite3_stmt *stmt = NULL;
    int query_status;

    const char *add_query = "INSERT INTO tasks (task, priority, daily) VALUES (?, ?, 1);";

    query_status = sqlite3_prepare_v2(DB, add_query, -1, &stmt, NULL);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }

    sqlite3_bind_text(stmt, 1, todo, -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 2, priority);
    query_status = sqlite3_step(stmt);
    if (query_status != SQLITE_DONE) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    printf("[Info]: Daily task added with priority %s\n", priority_label(priority));
    error:
    sqlite3_finalize(stmt);
}

static void
toradora_complete_task(sqlite3 *DB, const char *id)
{
    sqlite3_stmt *stmt = NULL;
    int query_status;
    int curr;
    char *end_ptr;
    int row_affected;
    const char *complete_query = "UPDATE tasks SET status = 1 WHERE id = ?;";

    query_status = sqlite3_prepare_v2(DB, complete_query, -1, &stmt, NULL);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    curr = (int)strtol(id, &end_ptr, 10);
    if (*end_ptr != '\0') {
        printf("[Error]: Invalid argument\n");
        manifest_usage();
        goto error;
    }
    sqlite3_bind_int(stmt, 1, curr);
    query_status = sqlite3_step(stmt);
    if (query_status != SQLITE_DONE) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    row_affected = sqlite3_changes(DB);
    if (row_affected == 0) {
        printf("[Info]: No rows were affected\n");
        printf("[Help]: Did you enter a valid task id?\n");
    } else {
        printf("[Info]: Task %d marked as complete\n", curr);
    }
    error:
    sqlite3_finalize(stmt);
}

static void
toradora_edit_task(sqlite3 *DB, const char *id, const char *new_task)
{
    sqlite3_stmt *stmt = NULL;
    int query_status;
    int curr;
    char *end_ptr;
    int row_affected;
    const char *edit_query = "UPDATE tasks SET task = ? WHERE id = ?;";

    query_status = sqlite3_prepare_v2(DB, edit_query, -1, &stmt, NULL);
    if (query_status != SQLITE_OK) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    curr = (int)strtol(id, &end_ptr, 10);
    if (*end_ptr != '\0') {
        printf("[Error]: Invalid argument\n");
        manifest_usage();
        goto error;
    }
    sqlite3_bind_text(stmt, 1, new_task, -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 2, curr);
    query_status = sqlite3_step(stmt);
    if (query_status != SQLITE_DONE) {
        printf("[Error]: Unexpected error during execution of query\n");
        printf("[Help]: Check database sanity\n");
        goto error;
    }
    row_affected = sqlite3_changes(DB);
    if (row_affected == 0) {
        printf("[Info]: No rows were affected\n");
        printf("[Help]: Did you enter a valid task id?\n");
    } else {
        printf("[Info]: Task %d updated\n", curr);
    }
    error:
    sqlite3_finalize(stmt);
}

/* Ensure new columns exist on older databases (migration) */
static void
toradora_migrate_db(sqlite3 *DB)
{
    char *err = NULL;
    /* Ignore errors - columns may already exist */
    sqlite3_exec(DB, "ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 2;", NULL, 0, &err);
    if (err) sqlite3_free(err);
    err = NULL;
    sqlite3_exec(DB, "ALTER TABLE tasks ADD COLUMN daily INTEGER NOT NULL DEFAULT 0;", NULL, 0, &err);
    if (err) sqlite3_free(err);
}

int
main(int argc, char *argv[])
{
    char *home_path = getenv("HOME");
    char *file_path = "/.toradora.db";
    char database_path[MAX_PATH_LENGTH];
    sqlite3 *DB;
    int db_exit = 0;
    int tab_exit = 0;
    char *message_error;

    if (home_path == NULL) {
        printf("[Error]: HOME environment variable not set.\n");
        return -1;
    }
    snprintf(database_path, sizeof(database_path), "%s%s", home_path, file_path);

    db_exit = sqlite3_open(database_path, &DB);
    if (db_exit) {
        printf("[Error]: Database corrupted\n");
        printf("[Help]: Delete database file and rerun the application\n");
        return -1;
    }

    char *create_table = "CREATE TABLE IF NOT EXISTS tasks ("
        "id INTEGER PRIMARY KEY NOT NULL,"
        "task TEXT NOT NULL,"
        "status INTEGER NOT NULL DEFAULT 0,"
        "priority INTEGER NOT NULL DEFAULT 2,"
        "daily INTEGER NOT NULL DEFAULT 0,"
        "created_at TEXT NOT NULL DEFAULT CURRENT_DATE"
        ");";

    tab_exit = sqlite3_exec(DB, create_table, NULL, 0, &message_error);
    if (tab_exit != SQLITE_OK) {
        printf("[Error]: Table creation failed\n");
        printf("%s\n", message_error);
        return -1;
    }

    /* Migrate existing databases to add new columns if missing */
    toradora_migrate_db(DB);

    /*
     * Argument parsing:
     *   toradora                          -> show active tasks
     *   toradora -z                       -> show all tasks
     *   toradora -h                       -> show usage
     *   toradora -a "task"                -> add task (medium priority)
     *   toradora -a "task" -p <1|2|3>    -> add task with priority
     *   toradora -d "task"               -> add daily task (medium priority)
     *   toradora -d "task" -p <1|2|3>   -> add daily task with priority
     *   toradora -c <id>                 -> complete task
     *   toradora -e <id> "new task"      -> edit task
     */
    if (argc == 1) {
        manifest_active_tasks(DB);
    } else if (argc == 2) {
        if (0 == strcmp(argv[1], "-z")) {
            manifest_all_tasks(DB);
        } else if (0 == strcmp(argv[1], "-h")) {
            manifest_usage();
        } else {
            manifest_usage();
            sqlite3_close(DB);
            return 1;
        }
    } else if (argc == 3) {
        if (0 == strcmp(argv[1], "-a")) {
            toradora_add_task(DB, argv[2], PRIORITY_MEDIUM);
        } else if (0 == strcmp(argv[1], "-d")) {
            toradora_add_daily_task(DB, argv[2], PRIORITY_MEDIUM);
        } else if (0 == strcmp(argv[1], "-c")) {
            toradora_complete_task(DB, argv[2]);
        } else {
            manifest_usage();
            sqlite3_close(DB);
            return 1;
        }
    } else if (argc == 4) {
        if (0 == strcmp(argv[1], "-e")) {
            toradora_edit_task(DB, argv[2], argv[3]);
        } else {
            manifest_usage();
            sqlite3_close(DB);
            return 1;
        }
    } else if (argc == 5) {
        /* toradora -a "task" -p <1|2|3> */
        /* toradora -d "task" -p <1|2|3> */
        if ((0 == strcmp(argv[1], "-a") || 0 == strcmp(argv[1], "-d"))
            && 0 == strcmp(argv[3], "-p")) {
            char *end_ptr;
            int priority = (int)strtol(argv[4], &end_ptr, 10);
            if (*end_ptr != '\0' || priority < 1 || priority > 3) {
                printf("[Error]: Priority must be 1, 2, or 3\n");
                manifest_usage();
                sqlite3_close(DB);
                return 1;
            }
            if (0 == strcmp(argv[1], "-a")) {
                toradora_add_task(DB, argv[2], priority);
            } else {
                toradora_add_daily_task(DB, argv[2], priority);
            }
        } else {
            manifest_usage();
            sqlite3_close(DB);
            return 1;
        }
    } else {
        manifest_usage();
        sqlite3_close(DB);
        return 1;
    }

    sqlite3_close(DB);
    return 0;
}
