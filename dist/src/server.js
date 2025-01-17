"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mssql_1 = __importDefault(require("mssql"));
const config_json_1 = __importDefault(require("./config.json"));
const md5_1 = __importDefault(require("md5"));
const authenticate_user_1 = require("./auth/authenticate-user");
const lodash_1 = __importDefault(require("lodash"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.listen(4000, () => {
    console.log("Server is listening on port", 4000);
});
let todos = [];
let userId = 0;
async function connectToDB() {
    const connection = new mssql_1.default.ConnectionPool(config_json_1.default);
    const connectionString = await connection.connect();
    return new mssql_1.default.Request(connectionString);
}
async function getAllToDos() {
    return await connectToDB().then((req) => req.query("select * from TaskList"));
}
async function postTask(request) {
    return await connectToDB().then((req) => req.query(`insert into TaskList (taskName, priority, taskDescription) values ('${request.body.taskName}','${request.body.priority}','${request.body.taskDescription}')`));
}
async function deleteTask(id) {
    return await connectToDB().then((req) => req.query(`delete from TaskList where id = ${id}`));
}
async function postUser(request) {
    const resultExists = await connectToDB().then(req => req.query(`select username from RegisteredUsers where email = '${request.body.username.trim()}'`));
    if (resultExists.rowsAffected.at(0) === 0) {
        return await connectToDB().then(req => req.query(`insert into RegisteredUsers 
      (firstName, lastName, email, username, password, contactNumber) values 
      ('${request.body.firstName.trim()}','${request.body.lastName.trim()}','${request.body.email.trim()}',
      '${request.body.username.trim()}','${(0, md5_1.default)(request.body.password.trim())}'
      ,'${request.body.contactNumber.trim()}'); 
      select scope_identity() as id`));
    }
    else {
        throw new Error('Email already exists!!');
    }
}
async function postLoggedInUser(request, id) {
    return await connectToDB().then((req) => req.query(`insert into LoggedInUsers (username, password, userId) values 
    ('${request.body.username.trim()}','${(0, md5_1.default)(request.body.password.trim())}',${id})`));
}
async function validateUser(request) {
    return await connectToDB().then((req) => req.query(`select * from LoggedInUsers where username = '${request.body.username.trim()}' and
      password = '${(0, md5_1.default)(request.body.password.trim())}'; 
    select scope_identity() as id`));
}
app.get('/', (req, res) => {
    console.log('Testing this GET API..');
    res.status(201).send('Hello from Docker and Kubernetes');
});
app.get("/api/todos", (req, res) => {
    getAllToDos().then((records) => {
        todos = records.recordset;
        res.send(todos);
    });
});
app.post("/api/todos", (req, res) => {
    postTask(req).then((response) => {
        res.status(201).send(response.rowsAffected);
    });
});
app.delete("/api/todos/:id", (req, res) => {
    deleteTask(req.params.id).then((response) => {
        res.status(201).send(response.rowsAffected);
    });
});
app.post("/api/register", (req, res) => {
    postUser(req).then((response) => {
        postLoggedInUser(req, response.recordset.at(0).id);
        userId = response.recordset.at(0).id;
        res.status(201).send(response.rowsAffected);
    }).catch(error => res.status(400).send(error.message));
});
app.post("/api/login", (req, res) => {
    validateUser(req).then(async (response) => {
        if (lodash_1.default.isEmpty(response.recordset)) {
            res.status(406).send("Invalid credentials, please try again later...");
        }
        else {
            const token = await (0, authenticate_user_1.signAccessToken)(response.recordset.at(0).userId);
            const resData = {
                username: req.body.username,
                userId: response.recordset.at(0).userId,
                token: token,
                expiresIn: Number('0.25') * 60 * 60 * 1000
            };
            res.status(201).send(resData);
        }
    });
});
//# sourceMappingURL=server.js.map