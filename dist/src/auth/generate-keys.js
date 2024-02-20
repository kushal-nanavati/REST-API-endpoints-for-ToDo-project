"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const access_token_secret = crypto_1.default.randomBytes(32).toString('hex');
fs_1.default.writeFileSync('.env', access_token_secret);
//# sourceMappingURL=generate-keys.js.map