import { TaskList } from "../models/todos.model";
import express, { Request } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mssql, { IResult } from "mssql";
import config from "./config.json";
import { LoggedInUsers, RegisteredUsers } from "../models/users.model";
import md5 from "md5";
import { signAccessToken } from "./auth/authenticate-user";
import _ from 'lodash';
import { AuthResponseData } from '../models/response.model';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(4000, () => {
  console.log("Server is listening on port", 4000);
});

let todos: TaskList[] = [];
let userId: number = 0;

async function connectToDB(): Promise<mssql.Request> {
  const connection = new mssql.ConnectionPool(config);
  const connectionString = await connection.connect();
  return new mssql.Request(connectionString);
}

async function getAllToDos(): Promise<mssql.IResult<TaskList[]>> {
  return await connectToDB().then((req) => req.query("select * from TaskList"));
}

async function postTask(
  request: Request<TaskList>
): Promise<mssql.IResult<TaskList>> {
  return await connectToDB().then((req) =>
    req.query(
      `insert into TaskList (taskName, priority, taskDescription) values ('${request.body.taskName}','${request.body.priority}','${request.body.taskDescription}')`
    )
  );
}

async function deleteTask(id: number): Promise<mssql.IResult<TaskList>> {
  return await connectToDB().then((req) =>
    req.query(`delete from TaskList where id = ${id}`)
  );
}

async function postUser(
  request: Request<RegisteredUsers>
): Promise<mssql.IResult<RegisteredUsers>> {    
    const resultExists = await connectToDB().then(req => req.query(`select username from RegisteredUsers where email = '${request.body.username.trim()}'`));    
    if(resultExists.rowsAffected.at(0) === 0) {
      return await connectToDB().then(req => req.query(`insert into RegisteredUsers 
      (firstName, lastName, email, username, password, contactNumber) values 
      ('${request.body.firstName.trim()}','${request.body.lastName.trim()}','${request.body.email.trim()}',
      '${request.body.username.trim()}','${md5(request.body.password.trim())}'
      ,'${request.body.contactNumber.trim()}'); 
      select scope_identity() as id`));      
    } else {
      throw new Error('Email already exists!!');      
    }
}

async function postLoggedInUser(
  request: Request<RegisteredUsers>,
  id: number
): Promise<mssql.IResult<RegisteredUsers>> {
  return await connectToDB().then((req) =>
    req.query(`insert into LoggedInUsers (username, password, userId) values 
    ('${request.body.username.trim()}','${md5(request.body.password.trim())}',${id})`)
  );
}

async function validateUser(
  request: Request<LoggedInUsers>
): Promise<mssql.IResult<LoggedInUsers>> {    
  return await connectToDB().then((req) =>
    req.query(`select * from LoggedInUsers where username = '${request.body.username.trim()}' and
      password = '${md5(request.body.password.trim())}'; 
    select scope_identity() as id`)
  );
}

app.get('/', (req, res) => {
  console.log('Testing this GET API.');  
  res.status(201).send('Hello from Docker and Kubernetes');
});

app.get("/api/todos", (req, res) => {
  getAllToDos().then((records) => {
    todos = records.recordset;
    res.send(todos);
  });
});

app.post("/api/todos", (req: Request<TaskList>, res) => {
  postTask(req).then((response) => {
    res.status(201).send(response.rowsAffected);
  });
});

app.delete("/api/todos/:id", (req: Request<TaskList>, res) => {
  deleteTask(req.params.id).then((response) => {
    res.status(201).send(response.rowsAffected);
  });
});

app.post("/api/register", (req: Request<RegisteredUsers>, res) => {
  postUser(req).then((response) => {
    postLoggedInUser(req, response.recordset.at(0).id);
    userId = response.recordset.at(0).id;
    res.status(201).send(response.rowsAffected);
  }).catch(error => res.status(400).send(error.message));
});

app.post("/api/login", (req: Request<LoggedInUsers>, res) => {
  validateUser(req).then(async (response) => {        
    if (_.isEmpty(response.recordset)) {
      res.status(406).send("Invalid credentials, please try again later...");
    } else {                  
      const token = await signAccessToken(response.recordset.at(0).userId);
      const resData: AuthResponseData = {
        username: req.body.username,
        userId: response.recordset.at(0).userId,
        token: token,
        expiresIn: Number('0.25') * 60 * 60 * 1000
      };
      res.status(201).send(resData);
    }
  });
});
