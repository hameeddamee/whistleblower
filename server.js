const express = require("express");
const path = require("path");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

// Load User Model
require("./models/User");
require("./models/Report");

// Passport Config
require("./config/passport")(passport);

// Load Routes
const index = require("./routes/index");
const auth = require("./routes/auth");
const reports = require("./routes/reports");

// Load Keys
const keys = require("./config/keys");

// Handlebars Helpers
const {
  truncate,
  stripTags,
  formatDate,
  select
} = require("./helpers/handlebars");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose
  .connect(keys.mongoURI, {
    useMongoClient: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MEthod Override Middelware
app.use(methodOverride("_method"));

app.engine(
  "hbs",
  handlebars({
    defaultLayout: "main",
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select
    }
  })
);
app.set("view engine", "hbs");

app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Use Routes
app.use("/", index);
app.use("/auth", auth);
app.use("/reports", reports);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});
