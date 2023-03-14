use actix_web::{ HttpResponse };
use types::users::User;
use mongodb::{
    bson::{doc, oid::ObjectId},
    Database
};
use serde_json::{json, Value};
use std::str::FromStr;

pub struct Manager {
    db: Database
}

impl Manager{
    pub fn start(db: Database) -> Self {
        Manager {
            db
        }
    }

    // user auth
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

    // profile viewing
    pub async fn getuser(&self, username: String) -> HttpResponse {
        let collection = self.db.collection::<User>("users");
        match collection.find_one(doc! {"username": format!("\"{}\"", username)}, None).await {
           Ok(res) => match res {
            Some(user) =>  {
                let mut friends: Vec<User> = vec![]; 
                        if let Ok(mut cursor) = collection.find(doc! {"_id": {"$in": user.friends}}, None).await {
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
                    "uid": match user._id {
                        Some(id) => id,
                        None => ObjectId::new()
                    },
                    "name": user.name,
                    "username": user.username,
                    "email": user.email,
                    "friends": friends
                }).to_string())
            },
            None => HttpResponse::NotFound().body(json!({"error": "There is no user with the supplied ID. Consider signing up first."}).to_string())
           },
           Err(_) => HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.find_one()"}).to_string())
        }
    }

    pub async fn notfriends(&self, request: Value) -> HttpResponse {
        let collection = self.db.collection::<User>("users");
        let mut exclude: Vec<ObjectId> = Vec::new();
        match serde_json::from_value::<Value>(request["me"].clone()) {
            Ok(me) => {
                exclude.push(ObjectId::from_str(&me.to_string().replace('"', "")).unwrap());
                match collection.find_one(doc!{"_id": ObjectId::from_str(&me.to_string().replace('"', "")).unwrap()}, None).await {
                    Ok(res) => match res {
                        Some(user) => {
                            exclude.extend(user.friends);
                            let mut notfriends: Vec<User> = vec![]; 
                            if let Ok(mut cursor) = collection.find(doc! {"_id": {"$nin": exclude}}, None).await {
                                let mut flag = true;
                                while flag {
                                    if let Ok(remains) = cursor.advance().await {
                                        if !remains { flag = false; }
                                        else {
                                            if let Ok(notfriend) = cursor.deserialize_current() { notfriends.push(notfriend) }
                                        }
                                    }
                                }
                            };
                            HttpResponse::Ok().body(json!({"results": notfriends}).to_string())
                        },
                        None => HttpResponse::NotFound().body(json!({"error": "There is no user with the supplied ID. Consider signing up first."}).to_string()),
                    },
                    Err(_) => HttpResponse::InternalServerError().body(json!({"error": ""}).to_string())
                }
            },
            Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'me' parameter"}).to_string()),
        }
    }

    // Friending management
    pub async fn friend(&self, request: Value) -> HttpResponse {
        let collection = self.db.collection::<User>("users");

        match serde_json::from_value::<Value>(request["me"].clone()) {
            Ok(me) => {
                let my_id = ObjectId::from_str(&me.to_string().replace('"', "")).unwrap();
                let my_doc = doc!{"_id":my_id};

                match serde_json::from_value::<Value>(request["friend"].clone()) {
                    Ok(friend) => {
                        let friend_id = ObjectId::from_str(&friend.to_string().replace('"', "")).unwrap();

                        match collection
                        .find_one(doc! {"_id": my_id}, None)
                        .await
                    {
                        Ok(Some(_)) => {

                             // Check if the friend is already in the user's friend list
                            if let Ok(Some(user)) = collection.find_one(my_doc.clone().clone(), None).await {
                                if user.friends.contains(&friend_id) {
                                    return HttpResponse::NotAcceptable().body(json!({"error": "Already friended"}).to_string());
                                }
                            }

                            // Add friend to user's friend list
                            if let Err(e) = collection.update_one(doc! {"_id": my_id}, doc! {"$push": {"friends": friend_id}}, None).await {
                                println!("{:?}", e);
                                return HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.update_one() with user's doc"}).to_string());
                            }

                            // Add user to friend's friend list
                            if let Err(_) = collection.update_one(doc! {"_id": friend_id}, doc! {"$push": {"friends": my_id}}, None).await {
                               
                                // rollback user's friend addition
                                let _ = collection.update_one(doc! {"_id": my_id}, doc! {"$pull": {"friends": friend_id}}, None).await;
                                return HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.update_one() with friend's doc"}).to_string());
                            }

                            // Return updated friend list
                            let updated_friends = if let Ok(Some(user)) = collection.find_one(doc! {"_id": my_id}, None).await {
                                let mut friend_objs = vec![];
                                if let Ok(mut cursor) = collection.find(doc! {"_id": {"$in": user.friends}}, None).await {
                                    let mut flag = true;

                                    while flag {
                                        if let Ok(remains) = cursor.advance().await {
                                            if !remains { flag = false; }
                                            else {
                                                if let Ok(friend_obj) = cursor.deserialize_current() {friend_objs.push(friend_obj)}
                                            }
                                        }
                                    }
                                }
                                friend_objs
                            } else {
                                vec![]
                            };

                            HttpResponse::Ok().body(json!({
                                "friends": updated_friends
                            }).to_string())
                        }
                        Ok(None) => HttpResponse::NotFound().json(json!({
                            "error": "There is no user with the supplied ID. Consider signing up first."
                        })),
                        Err(_) => HttpResponse::InternalServerError().json(json!({
                            "error": "Failed to find user document"
                        })),
                    }
                    },
                    Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'friend' parameter"}).to_string()),
                }       
            },
            Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'me' parameter"}).to_string()),
        }
    }

    pub async fn unfriend(&self, request: Value) -> HttpResponse {
        let collection = self.db.collection::<User>("users");

        match serde_json::from_value::<Value>(request["me"].clone()) {
            Ok(me) => {
                match serde_json::from_value::<Value>(request["friend"].clone()) {
                    Ok(friend) => {
                        match collection.find_one_and_update(doc!{"_id": ObjectId::from_str(&me.to_string().replace('"', "")).unwrap()}, doc! {"$pull": {"friends": ObjectId::from_str(&friend.to_string().replace('"', "")).unwrap()}}, None).await {
                            Ok(res) => {
                                match res {
                                    Some(_) => {
                                        match collection.find_one_and_update(doc!{"_id": ObjectId::from_str(&friend.to_string().replace('"', "")).unwrap()}, doc! {"$pull": {"friends": ObjectId::from_str(&me.to_string().replace('"', "")).unwrap()}}, None).await {
                                            Ok(_) => HttpResponse::Ok().body(json!({ "success": "Friend removed" }).to_string()),
                                            Err(_) => {
                                                // rollback like before
                                                let _ = collection.update_one(doc! {"_id": ObjectId::from_str(&me.to_string().replace('"', "")).unwrap()}, doc! {"$pull": {"friends": ObjectId::from_str(&friend.to_string().replace('"', "")).unwrap()}}, None).await;
                                                return HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.update_one() with friend's doc"}).to_string());
                                            }
                                        }
                                    },
                                    None => HttpResponse::NotFound().body(json!({"error": "There is no user with the supplied ID. Consider signing up first."}).to_string())
                                }
                            },
                            Err(_) => HttpResponse::InternalServerError().body(json!({"error": "The server had an error trying to execute mongodb::Collection.find_one_and_update()"}).to_string())
                        }
                    },
                    Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'friend' parameter"}).to_string()),
                }       
            },
            Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'me' parameter"}).to_string()),
        }
    }

    // Mutual friends
    pub async fn get_mutual_friends(&self, request: Value) -> HttpResponse {
        let collection = self.db.collection::<User>("users");

        match serde_json::from_value::<Value>(request["user1"].clone()) {
            Ok(one) => {
                match serde_json::from_value::<Value>(request["user2"].clone()) {
                    Ok(two) => {
                        match collection.find_one(doc! {"_id": ObjectId::from_str(&one.to_string().replace('"', "")).unwrap()}, None).await {
                            Ok(res) => match res {
                                Some(user1) => {
                                    match collection.find_one(doc! {"_id": ObjectId::from_str(&two.to_string().replace('"', "")).unwrap()}, None).await {
                                        Ok(res) => match res {
                                            Some(user2) => {
                                                let user1_friends = &user1.friends;
                                                let user2_friends = &user2.friends;
                                                let mut mutual_friends: Vec<User> = Vec::new();
                                                for friend_id in user1_friends {
                                                    if user2_friends.contains(friend_id) {
                                                        match collection.find_one(doc! {"_id": friend_id}, None).await {
                                                            Ok(res) => match res {
                                                                Some(user) => mutual_friends.push(user),
                                                                None => continue,
                                                            },
                                                            Err(_) => return HttpResponse::InternalServerError().body(json!({"error": "Error finding mutual friends"}).to_string()),
                                                        };
                                                    }
                                                }
                                                HttpResponse::Ok().body(json!({"mutual_friends": mutual_friends}).to_string())
                                            },
                                            None => return HttpResponse::NotFound().body(json!({"error": "There is no user 2 with the supplied ID. Consider signing up first."}).to_string()),
                                        },
                                        Err(_) => return HttpResponse::InternalServerError().body(json!({"error": "Error finding User1"}).to_string()),
                                    }
                                },
                                None => return HttpResponse::NotFound().body(json!({"error": "There is no user 1 with the supplied ID. Consider signing up first."}).to_string()),
                            },
                            Err(_) => return HttpResponse::InternalServerError().body(json!({"error": "Error finding User1"}).to_string()),
                        }
                    },
                    Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'user2' parameter"}).to_string()),
                }       
            },
            Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Request is missing the 'user2' parameter"}).to_string()),
        }
        
    }

    // searching
    pub async fn search(&self, request: Value) -> HttpResponse {
        let collection = self.db.collection::<User>("users");
    
        match serde_json::from_value::<Value>(request["query"].clone()) {
            Ok(query) => {
                // basically, this filter treats the entire query as a regular expression
                // and performs a case insensitive search
                // let query_regex = format!(".*{}.*", &query.to_string());
                let mut cursor = collection.find(None, None).await.unwrap();

                let mut result = vec![];
                let query_lowercase = query.to_string().trim_matches('"').to_lowercase();
                let mut flag = true;

                while flag {
                    if let Ok(remains) = cursor.advance().await {
                        if !remains { flag = false; }
                        else {
                            if let Ok(user) = cursor.deserialize_current() {
                                if user.name.to_lowercase().contains(&query_lowercase)
                                || user.username.to_lowercase().contains(&query_lowercase)
                                {
                                    result.push(user);
                                }
                            }
                        }
                    }
                };

                println!("{:?}", result);
                HttpResponse::Ok().body(json!({"results": result}).to_string())
            },
            Err(_) => HttpResponse::NotAcceptable().body(json!({"error": "Message is missing the 'query' parameter"}).to_string())
        }
    }
    
    
}