mod manager;

pub use crate::manager::Manager;
use actix_files as fs;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use mongodb::{options::ClientOptions, Client};
use serde_json::json;

#[post("/signup")]
async fn signup(context: web::Data<Manager>, req_body: String) -> impl Responder {
    println!("Started signup");
     match serde_json::from_str(&req_body) {
        Ok(data) => context.signup(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(json!({
            "error": "Failed to parse request. Make sure it is a valid JSON payload."
        }).to_string())
    }
}

#[post("/signin")]
async fn signin(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.signin(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(json!({
            "error": "Failed to parse request. Make sure it is a valid JSON payload."
        }).to_string())
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let mut client_options = ClientOptions::parse("mongodb://localhost:8080/")
        .await
        .unwrap();
    client_options.app_name = Some("carestack".to_string());
    let client = Client::with_options(client_options).unwrap();
    let database = client.database("carestack");
    // Create Actix web server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Manager::start(database.clone())))
            .service(signup)
            .service(signin)
            .service(fs::Files::new("/", "./ui/build").index_file("index.html"))
    })
    .bind(("127.0.0.1", 7878))?
    .run()
    .await
}