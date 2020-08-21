import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import dotenv from "dotenv";
import mongoose from "mongoose";
import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = 4000;

(async () => {
  await mongoose.connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
})();

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB CONNECTION!!");
});

db.on("error", (err) => {
  console.log("DB ERROR:", err);
});

app.set("view engine", "ejs");
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token"); //1
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.cookies.userData;
  next();
});

app.use("/", require("./routes/home"));
app.use("/users", require("./routes/users"));
//app.use("/musics", require("./routes/musics"));

app.listen(PORT, () => {
  console.log("Server Starting...", PORT);
});
