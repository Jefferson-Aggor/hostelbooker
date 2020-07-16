const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");

const app = express();

// require files
require("./config/passport")(passport);
const { mongoURI } = require("./config/keys");
const index = require("./routes/index");
const dashboard = require("./routes/dashboard");

// handlebar helpers
const { formatDate } = require("./hbs/helper");

// Make static dir
app.use(express.static(path.join(__dirname, "Public")));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// handlebars
app.engine(
  "handlebars",
  exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: { formatDate },
  })
);
app.set("view engine", "handlebars");

// Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

// method override
app.use(methodOverride("_method"));

// locals
app.use((req, res, next) => {
  res.locals.error_msg = req.flash("error_msg");
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error = req.flash("error");
  res.locals.loggedUser = req.user;
  next();
});

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// connect mongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`mongoDB connected`))
  .catch((err) => console.log(`Error from mongdb: ${err.message}`));

// set routers
app.use("/", index);
app.use("/hb/dashboard", dashboard);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
