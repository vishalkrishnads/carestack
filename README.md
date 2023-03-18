# CareStack
> This repo is the test submission for an internship role at [CareStack](https://carestack.com). 

A mini social network, where users can join, search for others, friend and unfriend each other. This application is written in a way that it's easily extensible in terms of functionality. All you have to do is write a new function for the database transaction you have to do and simply extend the UI around it. Read more about what's already working in [features](#features).

**🎉 A deployment is already live [here](https://carestack.selseus.com)!**

## Table Of Contents
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. Installation
4. Web API
5. Known Issues

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
