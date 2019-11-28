"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const server = express_1.default();
const limiter = express_rate_limit_1.default({
    windowMs: 10 * 1000,
    max: 100
});
server.use(body_parser_1.default.json());
server.use(body_parser_1.default.urlencoded({ extended: false }));
server.use(limiter);
exports.default = server;
//# sourceMappingURL=index.js.map