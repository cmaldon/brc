const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/bahamas_data';

let db;

let aboutMessage = "Employee Tracker API";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    employeeList,
  },
  Mutation: {
    setAboutMessage,
    employeeAdd,
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function employeeList() {
  const employees = await db.collection('employees').find({}).toArray();
  return employees;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function employeeValidate(employee) {
  const errors = [];
  if (employee.firstName.length < 3) {
    errors.push('Field "name" must be at least 3 characters long.');
  }
  if (employee.status === 'Assigned' && !employee.department) {
    errors.push('Field "Department" is required when status is "Volunteer"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function employeeAdd(_, { employee }) {
  employeeValidate(employee);
  employee.created = new Date();
  employee.id = await getNextSequence('employees');

  const result = await db.collection('employees').insertOne(employee);
  const savedEmployee = await db.collection('employees')
  .findOne({ _id: result.insertedId });
  return savedEmployee;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3001, function () {
    console.log('Employee App started on port 3001');
  });
 } catch (err) {
   console.log('ERROR:', err);
 }
})();
