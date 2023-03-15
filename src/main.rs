mod manager;


pub use crate::manager::Manager;
use actix_files as fs;
use actix_web::{
    get, post, web, web::Path, App, HttpResponse, HttpServer, Responder,
};
use mongodb::{options::ClientOptions, Client};
use serde_json::json;

#[post("/api/search")]
async fn search(context: web::Data<Manager>, req_body: String) -> impl Responder{
    match serde_json::from_str(&req_body) {
        Ok(data) => context.search(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[get("/api/user/{username}")]
async fn getuser(context: web::Data<Manager>, path: Path<String>) -> impl Responder {
    context.getuser(path.into_inner()).await
}

#[get("/api/mutual")]
async fn mutual(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.get_mutual_friends(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/api/friend")]
async fn friend(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.friend(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/api/unfriend")]
async fn unfriend(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.unfriend(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/notfriends")]
async fn notfriends(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.notfriends(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/api/signup")]
async fn signup(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.signup(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/api/signin")]
async fn signin(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.signin(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[post("/api/updatebio")]
async fn update_bio(context: web::Data<Manager>, req_body: String) -> impl Responder {
    match serde_json::from_str(&req_body) {
        Ok(data) => context.update_bio(data).await,
        Err(_) => HttpResponse::NotAcceptable().body(
            json!({
                "error": "Failed to parse request. Make sure it is a valid JSON payload."
            })
            .to_string(),
        ),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let server_port = 7878;
    let db_port = 8080;

    let mut client_options = ClientOptions::parse(format!("mongodb://localhost:{}/", db_port))
        .await
        .unwrap();
    client_options.app_name = Some("carestack".to_string());
    let client = Client::with_options(client_options).unwrap();
    let database = client.database("carestack");
    // Create Actix web server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Manager::start(database.clone())))
            .service(search)
            .service(signup)
            .service(signin)
            .service(getuser)
            .service(notfriends)
            .service(friend)
            .service(unfriend)
            .service(mutual)
            .service(update_bio)
            .service(fs::Files::new("/", "./ui/build").index_file("index.html"))
    })
    .bind(("127.0.0.1", server_port))?
    .run()
    .await
}
