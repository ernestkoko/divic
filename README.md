# NestJS GraphQL Prisma PostgreSQL Project

This project is a NestJS application with PostgreSQL as the database, Prisma as the ORM, and GraphQL for API communication or transportation layer. It includes a user model with biometric login capabilities.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [GraphQL Playground](#graphql-playground)
- [Testing the Application](#testing-the-application)

## Features

- User registration and login
- Biometric login using hashed biometric keys
- GraphQL API
- Prisma ORM for database interaction

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 21.x or later
- **npm**: Version 10.x or later
- **PostgreSQL**: Ensure you have PostgreSQL installed and running on your local machine

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Install Prisma CLI**:

    ```bash
    npm install -g prisma
    ```
4. **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
5. **Run database migrations**:
    ```bash
    npx prisma migrate dev
    ```

## Environment Variables

- Create a `.env` file in the root of your project directory and add the following environment variables:

```dotenv
DATABASE_URL="postgresql://<your-username>:<your-password>@localhost:<DB_PORT>/<your-database>"
APP_PORT="port-the-app-should-run-on"
SALT="salt-for-hashing";
JWT_SECRET="secret-for-jwt"
JWT_EXPIRATION_TIME="expiration-duration-for-jwt-token"

For example
DATABASE_URL=postgresql://divic:divicpassword@localhost:5432/divicdb
APP_PORT=3001
SALT=10;
JWT_SECRET=secret
JWT_EXPIRATION_TIME=1d
```

## Running the Application
- When you are done cloning and setting the required variables in the .env file you create, you can run the application by opening your terminal and naviagating to the project directory to run

  ```bash 
  npm run start:dev
  ```

## GraphQL Playground
- Navigate to the playground on your browser
 http://localhost:PORT/graphql

## Testing the Application
- Open your terminal and navigate to the project directory and run: 
  ```bash
  npm run test
  ```


