import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import authRouter from "./routes/auth";
import webhookRouter from "./routes/webhook";
import keys from "../config/keys";

const server = express();

const limiter = rateLimit({
	windowMs: 10 * 1000, // 10 seconds
	max: 100
});

server.set("view engine", "ejs");
server.set("views", __dirname + "/views");

console.log(path.join(__dirname + "/../public"));

server.use(express.static(path.join(__dirname + "/.." + "/public")));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(limiter);

// Implement our custom routes
server.use("/auth", authRouter);
server.use("/webhook", webhookRouter);

// Root route
server.get("/", (req, res) => {
	res.render("home", {
		client_id: keys.DISCORD_CLIENT_ID
	});
});

export default server;
