import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

const server = express();

const limiter = rateLimit({
	windowMs: 10 * 1000, // 10 seconds
	max: 100
});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(limiter);

export default server;
