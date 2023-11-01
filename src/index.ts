import * as http from 'http';
import 'reflect-metadata';
import App from './core/app';
import UserController from './user-controller';

const controllers = [ UserController ]
const app = new App(controllers)

const PORT = 3000;
const server = http.createServer(app.instance);
server.listen(PORT, () => {
    console.log(`Server is listening on :${PORT}`);
});