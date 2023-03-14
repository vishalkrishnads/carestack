use actix_web::HttpResponse;
use types::users::User;
use mongodb::{
    bson::{doc, oid::ObjectId},
    Database
};
use serde_json::{json, Value};

pub struct Manager {
    db: Database
}

impl Manager{
    pub fn start(db: Database) -> Self {
        Manager {
            db
        }
    }

    pub async fn signup(&self, request: Value) -> HttpResponse {
        let user = User::parse_request(request);
        let collection = self.db.collection::<User>("users");
        // this processing can be further sped up by directly using doc!{"$or": [{"username": user.username}, {"email": user.email}]}
        // but it would take away from the amount of detail which can be provided to the client
        // compromising on it currently as sign up is a one time operation
        match collection.find_one(doc! {"email": &user.email}, None).await {
            Ok(data) => match data {
                Some(data) => HttpResponse::Conflict().body(
                    json!({
                        "error":
                            format!("Another user already exists with the email {}", data.email)
                    })
                    .to_string(),
                ),
                None => match collection
                    .find_one(doc! {"username": &user.username}, None)
                    .await
                {
                    Ok(data) => match data {
                        Some(data) => HttpResponse::Conflict().body(
                            json!({
                                "error":
                                    format!(
                                        "Another user already exists with the username {}",
                                        data.username
                                    )
                            })
                            .to_string(),
                        ),
                        None => {
                            match collection.insert_one(User {
                                _id: Some(ObjectId::new()),
                                name: user.name,
                                username: user.username,
                                password: user.password,
                                email: user.email,
                                friends: Vec::new()
                            }, None).await {
                                Ok(data) => HttpResponse::Ok().body(json!({"success": "Successfully signed up user", "uid": data.inserted_id}).to_string()),
                                Err(_) => HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.insert_one()"}).to_string())
                            }
                        }
                    },
                    Err(_) => HttpResponse::InternalServerError()
                        .body("Error when trying to execute mongodb::Collection.find_one()"),
                },
            },
            Err(_) => HttpResponse::InternalServerError()
                .body("Error when trying to execute mongodb::Collection.find_one()"),
        }
    }

    pub async fn signin(&self, request: Value) -> HttpResponse {
        let user = User::parse_request(request);

        let collection = self.db.collection::<User>("users");
        match collection.find_one(doc!{"$or": [{"username": user.username}, {"email": user.email}]}, None).await {
            Ok(data) => match data {
                Some(data) => {
                    if data.password != user.password { HttpResponse::Unauthorized().body(json!({"error": "Wrong credentials"}).to_string()) }
                    else {
                        let mut friends: Vec<User> = vec![]; 
                        if let Ok(mut cursor) = collection.find(doc! {"_id": {"$in": data.friends}}, None).await {
                            let mut flag = true;
                            while flag {
                                if let Ok(remains) = cursor.advance().await {
                                    if !remains { flag = false; }
                                    else {
                                        if let Ok(friend) = cursor.deserialize_current() { friends.push(friend) }
                                    }
                                }
                            }
                        };
                        HttpResponse::Ok().body(json!({
                            "uid": match data._id {
                                Some(id) => id,
                                None => ObjectId::new()
                            },
                            "name": data.name,
                            "username": data.username,
                            "email": data.email,
                            "friends": friends
                        }).to_string())
                     }
                },
                None => HttpResponse::NotFound().body(json!({"error": "User with this username/email wasn't found. You haven't signed up probably"}).to_string())
            },
            Err(_) => HttpResponse::InternalServerError().body(json!({"error": "There was an error when trying to execute mongodb::collection.find_one()"}).to_string())
        }
    }
}