use axum::serve;
use axum::{
    extract::{Extension, Path},
    routing::{delete, get, post, put},
    Json, Router,
};
use http::header::CONTENT_TYPE;
use http::method::Method;
use log::info;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer}; // Import CORS layer // no need header

#[derive(Serialize, Deserialize)]
struct Todo {
    id: i64,
    title: String,
    completed: i64,
}

#[derive(Serialize, Deserialize)]
struct NewTodo {
    title: String,
    completed: i64,
}

#[derive(Serialize, Deserialize)]
struct UpdateTodo {
    title: Option<String>,
    completed: i64,
}

async fn list_todos(Extension(pool): Extension<SqlitePool>) -> Json<Vec<Todo>> {
    let todos = sqlx::query_as!(Todo, "SELECT id, title, completed FROM todos")
        .fetch_all(&pool)
        .await
        .unwrap();
    Json(todos)
}

async fn create_todo(
    Extension(pool): Extension<SqlitePool>,
    Json(payload): Json<NewTodo>,
) -> Json<Todo> {
    let completed_i64 = if payload.completed != 0 { 1 } else { 0 };
    let todo = sqlx::query_as!(
        Todo,
        "INSERT INTO todos (title, completed) VALUES (?, ?) RETURNING id, title, completed",
        payload.title,
        completed_i64
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    Json(todo)
}

async fn update_todo(
    Extension(pool): Extension<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateTodo>,
) -> Json<Todo> {
    let existing_todo = sqlx::query_as!(
        Todo,
        "SELECT id, title, completed FROM todos WHERE id = ?",
        id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    let title = payload.title.unwrap_or(existing_todo.title);

    let result = sqlx::query!(
        "UPDATE todos SET title = ?, completed = ? WHERE id = ? RETURNING id, title, completed",
        title,
        payload.completed,
        id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    let todo = Todo {
        id: result.id.unwrap(),
        title: result.title,
        completed: result.completed,
    };

    Json(todo)
}

async fn delete_todo(Extension(pool): Extension<SqlitePool>, Path(id): Path<i64>) -> Json<()> {
    sqlx::query!("DELETE FROM todos WHERE id = ?", id)
        .execute(&pool)
        .await
        .unwrap();
    Json(())
}

pub async fn start_api() {
    let pool = SqlitePool::connect("sqlite:../data/database.db")
        .await
        .expect("Failed to connect to the database");
// keeping database under src-tauri cause database not be found
// cargo sqlx prepare --database-url sqlite:../data/database.db is a solution everytime before building the app

    let cors = CorsLayer::new()
        .allow_origin(Any) // Allow any origin, or replace with Origin::exact("http://localhost:1420".parse().unwrap()) if needed.
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE]) // Allow specific methods
        .allow_headers(vec![CONTENT_TYPE]); // Allow Content-Type header

    let app = Router::new()
        .route("/todos", get(list_todos))
        .route("/todos", post(create_todo))
        .route("/todos/{id}", put(update_todo))
        .route("/todos/{id}", delete(delete_todo))
        .layer(Extension(pool))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");
    info!("API server running on {}", addr);
    serve(listener, app.into_make_service())
        .await
        .expect("Failed to serve");
}
