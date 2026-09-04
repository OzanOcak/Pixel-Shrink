# Tauri + React + Typescript

```bash
mkdir data
touch data/database.db
sqlite3 data/database.db

CREATE TABLE todos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
completed INTEGER NOT NULL DEFAULT 0
);

INSERT INTO todos (title, completed) VALUES ('Sample Todo 1', 0);
INSERT INTO todos (title, completed) VALUES ('Sample Todo 2', 1);

.table
.schema
select * from todos;
.exit

npm run tauri dev
cd src-tauri
cargo build
```

- refer to https://oocak.com/blogpost/tauri-sqlx

## the flow with SQLX

```bash

mkdir data
touch data/database.db
cd src-tauri
sqlx migrate add initial_migration

2 files will be create; up file create, down file drop
cargo tauri icon
echo "DATABASE_URL=sqlite:../data/database.db" > .env
sqlx migrate run

```

## to generate icon

```bash
cargo install tauri-cli

cargo tauri icon
```
