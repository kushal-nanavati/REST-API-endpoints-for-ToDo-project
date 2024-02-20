"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
function signAccessToken(userId) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ userId }, crypto_1.default.randomBytes(32).toString('hex'), {
            expiresIn: '0.25h',
        }, (err, token) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(token);
            }
        });
    });
}
exports.signAccessToken = signAccessToken;
//# sourceMappingURL=authenticate-user.js.map