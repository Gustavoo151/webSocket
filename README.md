WebSocket - Project Documentation

## 1. Project Overview

This project is a real-time chat application that implements WebSocket technology to enable instant communication between users and admins. The application is built with TypeScript, Express, Socket.IO, and uses SQLite as its database with TypeORM for database operations.

## 2. Architecture

The project follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle database operations
- **Entities**: Define database models
- **WebSocket**: Manage real-time communication
- **Routes**: Define API endpoints

## 3. Database Structure

The application uses four main entities:

### User Entity (src/entities/User.ts)

- Represents users in the system
- Fields: id, email, created_at

### Message Entity (src/entities/Message.ts)

- Stores chat messages
- Fields: id, admin_id, text, user_id, created_at
- Relations: ManyToOne with User

### Connection Entity (src/entities/Connection.ts)

- Tracks active socket connections
- Fields: id, admin_id, socket_id, user_id, created_at, updated_at
- Relations: ManyToOne with User

### Setting Entity (src/entities/Setting.ts)

- Stores application settings per user
- Fields: id, username, chat (boolean), created_at, updated_at

## 4. API Endpoints

The project defines the following REST endpoints in routes.ts:

### Settings

- `POST /settings`: Create new settings
- `GET /settings/:username`: Get settings by username
- `PUT /settings/:username`: Update settings for a username

### Users

- `POST /users`: Create a new user

### Messages

- `POST /messages`: Create a new message
- `GET /messages/:id`: Get messages by user ID

## 5. WebSocket Events

The application implements two WebSocket handlers:

### Client Events (src/websocket/client.ts)

- `client_first_access`: Handles user's first connection
- `client_send_to_admin`: Forwards messages from users to admins
- `disconnect`: Handles user disconnection

### Admin Events (src/websocket/admin.ts)

- `admin_list_messages_by_user`: Retrieves messages for a specific user
- `admin_send_message`: Sends messages from admin to users
- `admin_user_in_support`: Assigns an admin to support a user

## 6. Services

The application defines several services that implement business logic:

### UsersService (src/services/UsersService.ts)

- `create(email)`: Creates a new user or returns existing one
- `findByEmail(email)`: Finds a user by email

### MessagesService (src/services/MessagesService.ts)

- `create({ admin_id, text, user_id })`: Creates a new message
- `listByUser(user_id)`: Lists messages for a specific user

### ConnectionsService (src/services/ConnectionsService.ts)

- `create({ socket_id, user_id, admin_id, id })`: Creates a connection record
- `findByUserId(user_id)`: Finds connection by user ID
- `findAllWithoutAdmin()`: Finds all connections without admin assignment
- `findBySocketID(socket_id)`: Finds connection by socket ID
- `updateAdminID(user_id, admin_id)`: Assigns admin to a user
- `deleteBySocketId(socket_id)`: Removes connection when socket disconnects

### SettingsService (src/services/SettingsService.ts)

- `creat({ chat, username })`: Creates settings for a username
- `findByUsername(username)`: Finds settings by username
- `update(username, chat)`: Updates chat settings

## 7. Controllers

### UsersController (src/controllers/UsersController.ts)

- `create`: Handles user creation requests

### MessagesController (src/controllers/MessageController.ts)

- `create`: Handles message creation
- `showByUser`: Shows messages for a specific user

### SettingsController (src/controllers/SettingsController.ts)

- `create`: Creates settings
- `findByUsername`: Retrieves settings by username
- `update`: Updates settings

## 8. Testing

The project uses Jest for testing. Tests are located in **tests** directory.

### MessageController Tests (src/**tests**/controllers/MessageController.spec.ts)

- Tests for the `create` method
- Tests for the `showByUser` method

## 9. Server Setup

The server setup is handled in two main files:

### HTTP Server (src/http.ts)

- Configures Express
- Sets up static file serving
- Initializes Socket.IO
- Configures view rendering with EJS

### Main Server (src/server.ts)

- Imports WebSocket handlers
- Starts the HTTP server on port 3333

## 10. Running the Application

To run the application:

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Access client interface:

   ```
   http://localhost:3333/pages/client
   ```

4. Access admin interface:
   ```
   http://localhost:3333/pages/admin
   ```

## 11. Database Configuration

The database configuration is defined in ormconfig.json:

- Uses SQLite database stored at `./src/database/database.sqlite`
- Registers entities from `./src/entities/**.ts`
- Defines migrations in `./src/database/migrations/**.ts`
