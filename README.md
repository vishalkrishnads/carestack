# CareStack
> :warning: This repo is the test submission for an internship role at [CareStack](https://carestack.com). 

A mini social network, where users can join, search for others, friend and unfriend each other. This application is written in a way that it's easily extensible in terms of functionality. All you have to do is write a new function for the database transaction you have to do and simply extend the UI around it. Read more about what's already working in [features](#features).

**🎉 A deployment is live [here](https://carestack.selseus.com)!** You can also view a screen recorded video below...

https://user-images.githubusercontent.com/50231856/226114647-0f929238-9c9f-4b8c-889e-1fb1e0395eaf.mp4

## Table Of Contents
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Installation](#installation)
4. [Known Issues](#known-issues)

## Tech Stack
This is a web app. As it should be obvious, there are two main components to the application: front-end & back-end. This section details about the choices made in the implementation of both, about what tools and/or frameworks were used and why. This structure was adopted so as to enable easy extensibility for future development.

### Back-end
At the back-end holding the app together is a web server, written in [Rust](https://www.rust-lang.org/) using the [Actix](https://actix.rs) framework. Rust is a low level language as compared to other available alternatives like JavaScript (with [Node.js](https://nodejs.org)) or Python (with [Flask](https://flask.palletsprojects.com/en/2.2.x/)) and hence is very performant and computationally efficient. This is especially helpful for reducing latency and deployment costs for the server. Rust also enables extremely fast response times from the API since there is much less computation happening overall. Hence, the choice of programming language was narrowed down to Rust after much thought. As such, this API has been recorded delivering responses in under 7ms, including the time taken for database transactions.

As for the database itself, the app uses a [MongoDB](https://mongodb.com) database which lives in the server itself, for storing all user data. Since the whole app was written in a week, SQL databases with fixed schemas weren't going to cut it. As such, one of the few databases with built in encryption & official support for Rust was chosen.

### Front-end
The front end is a basic web app written in [React](https://react.dev) using HTML and CSS. It is basically an interface to connect the user with the API endpoints and display the results in an intuitive manner. Although it hasn't been optimized yet for mobile, it is usable as of now since it was written with the CSS Flexbox layout.
The app uses the browser's [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to store user credentials and manage user state. Due to time constraints, I avoided the common practice of setting up & using [Redux](https://redux.js.org/) in the app.

## Features
The application currently includes the following features in fully working format, but has an easily extensible structure for anyone looking to work on it:
* Users are able to sign up/sign in, and create a profile for themselves, although images aren't supported as of yet
* Search for other users
* View other users' profiles & make them friends/unfriend them
* View a list of mutual friends between users. 
  *A mutual friend is a user who is a friend of two other users who may or may not know each other*

## Installation
The steps for running this code on your machine locally assumes that you have all the prerequisites set up and running. If you face any issues, please refer to the respective documentations of the components for help.

Alternatively, you can view the already running version right from your browser by visiting the deployment [here](https://carestack.selseus.com)!

### Prerequisites
* The Rust toolchain, including cargo: Install from [here](https://www.rust-lang.org/tools/install) by downloading the `rustup-init` executable for your platform. Alternatively, download & run the standalone installer for your platform from the links provided [here](https://forge.rust-lang.org/infra/other-installation-methods.html#standalone-installers).
* Git CLI: Install by running the executable for your platform available [here](https://git-scm.com/downloads).
* MongoDB Community Server: After running the installer found [here](https://www.mongodb.com/try/download/community), make sure that the server is up and running on port **27017**. 

    > **Note**
    > 27017 is of course the default port that it'd be running on. If you somehow end up running it on a different port, make sure to keep it in mind when running the code later as some changes would be required.
* **Optional** - Node.js (v18.x.x preferred): Download the installer for your platform [here](https://nodejs.org/en).

   > **Note**
   > on Linux, you can run `apt install nodejs`, but it usually installs an older version, which will most likely have problems running this codebase. So, it'd be better to avoid it. You can always check the installed version using `npm -v`.
### Build & Run
After making sure that all prerequisites are satisfied, follow the steps one by one to build and run the code.
1. Either clone this repo

    ```
    git clone https://github.com/vishalkrishnads/carestack.git
    ```
   or make a new directory and pull the code
  
    ```
    mkdir carestack && cd carestack
    git init
    git remote add origin https://github.com/vishalkrishnads/carestack.git
    git pull origin main
    ```
2. Start the API server

    ```
    cargo run
    ```
    > **Note**
    > If your MongoDB server is running on a different port, here's where you'll have to make a change to reflect it. Before executing `cargo run`, open up [`/src/main.rs` on line 122](https://github.com/vishalkrishnads/carestack/blob/docs/src/main.rs#L122), and change the `db_port` variable to your new port value.
    > ```rust
    > #[actix_web::main]
    > async fn main() -> std::io::Result<()> {
    >     let server_port = 7878;
    >     let db_port = 27017; // change to your port number
    >
    >     // rest of main()
    > }
    > ```
    
    At this point, a UI will be served on port **7878**, which you can view by visiting [localhost:7878](http://localhost:7878) on your browser. But, do note that this UI is buggy when refreshed due to it being served from the API server directly. If you want to see the same UI from the [live version](https://carestack.selseus.com), continue along.

> **Note**
>
> If you haven't installed Node.js, open up the [`/ui/build/index.html`](https://github.com/vishalkrishnads/carestack/blob/docs/ui/build/index.html) in your browser by double clicking it. This is the final UI. You can skip steps 3 & 4.

3. Install all JavaScript dependencies

    ```
    cd ui && npm install
    ```
4. Start the UI development server

    ```
    npm start
    ```

The final UI will now be served on port **3000**, which you can view by visiting [localhost:3000](http://localhost:3000) in your browser. That's it, happy viewing! :beers:

## Known Issues
* In the UI served from the API server, there is a problem when refreshing the UI manually. As the React app uses [React Router](https://reactrouter.com/) to render the content, the server fails to effectively propogate the URL to it thereby causing it to crash randomly. However, this has been resolved in the bare version as well as in the [live deployment](https://carestack.selseus.com) using Nginx to propogate the URL.
* The code quality of the front-end itself is another issue. There are many places where a lot of refactoring could be done to reduce code size and improve code quality. For instance, the networking code and `localStorage` code could be refactored and reused.
* In a production environment, the app is not secure because it lacks data encryption during transit. Only the standard HTTPS encryption is present. This has happened because of the fast paced development of the stack.
