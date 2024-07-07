const express = require("express");
const mongoose = require("mongoose");
const app = express();
const fs = require("fs");
const postsRoutes = require("./routes/postsRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
require("dotenv").config();

async function startServer() {
  /* Connect to the MongoDB */
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    /* listen for env.PORT or 3000 */
    const PORT = process.env.PORT || 3000;
    app.listen(PORT);

    console.log(`Server has been started on port: ${PORT}`);
  } catch (error) {
    console.log("There was an error starting the server:", error);
  }
}

startServer();

/* Storing Session */
const store = new MongoDBSession({
  uri: process.env.MONGODB_URI,
  collection: "session"
});

store.on ('error', (error)=> console.log (error));

// middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(expressLayouts);
app.use(cookieParser()); 
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60 /* 1hr session */,
      secure: false,
    },
    store: store,
  })
);
/* assign a local variable for EJS to store the userdata */
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;

  /* can be access with: <%= user.username %> */
  next();
});

app.use ((req,res,next)=> {
  console.log (`Session ID: ${req.session.id}`);
  console.log (`Cookies:`, req.cookies["connect.sid"])
  console.log (`Header Cookies: ${req.headers.cookie}`)
  next()
})


app.set("view engine", "ejs");
app.set("layout", "layouts/main");


app.get("/", (req, res) => {
  res.render("home/index", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about/about", { title: "About" });
});

app.get("/contact", (req, res) => {
  res.render("contact/contact", { title: "Contact" });
});

/* router */
app.use(userRoutes);
app.use("/posts", postsRoutes);

/* handle missing page */
app.use((req, res) => {
  res
    .status(404)
    .render("error/error", { title: "404", error_message: "Page not found." });
});
