# spring-boot-node

## How to use

Create controller classes in a similar manner to spring boot

### user.controller.ts
```typescript
import { NextFunction, Request, Response } from 'express';
import { Controller, Delete, Get, Middleware, Post, Put } from '.';

interface User {
    id: number
    name: string
}

@Controller('/api/users')
export default class UserController {

    private userId = 2

    private users: User[] = [
        { id: 1, name: 'Julian' },
        { id: 2, name: 'Arnold' },
    ];

    @Get()
    public get(req: Request, res: Response) {
        res.status(200).json(this.users);
    }
    
    @Get('/:id')
    public findById(req: Request, res: Response) {
        const id = Number(req.params.id)
        const user = this.users.find(x => x.id == id);
        if (user) {
            return res.status(200).json({ user });
        }
        return res.status(404).json({ message: 'User not found!' });
    }

    @Post()
    public add(req: Request, res: Response) {
        const name = req.body.name
        this.userId++
        const user = { id: this.userId, name }
        this.users.push(user);
        res.status(200).json(user);
    }

    @Put('/:id')
    public update(req: Request, res: Response) {
        const name = req.body.name
        const id = Number(req.params.id)
        const user = this.users.find(x => x.id == id);
        if (!user) {
            return res.status(400).json({ message: 'User not found!' })
        }
        user.name = name
        res.status(200).json(user);
    }

    @Delete('/:id')
    public delete(req: Request, res: Response) {
        const id = Number(req.params.id)
        const index = this.users.findIndex(x => x.id == id);
        if (index == -1) {
            return res.status(400).json({ message: 'User not found!' })
        }
        this.users.splice(index, 1)
        res.status(200).json();
    }

    @Middleware({ path:'/', order: 1 })
    public log1(req: Request, res: Response, next: NextFunction) {
        console.log("-----1-----")
        next()
    }
    @Middleware({ path:'/', order: 4 })
    public log3(req: Request, res: Response, next: NextFunction) {
        console.log("-----4-----")
        next()
    }
    @Middleware({ path:'/', order: 3 })
    public log4(req: Request, res: Response, next: NextFunction) {
        console.log("-----3-----")
        next()
    }
    @Middleware({ path:'/', order: 2 })
    public log2(req: Request, res: Response, next: NextFunction) {
        console.log("-----2-----")
        next()
    }
}
```

Pass an array of controller classes into the App class and create the server with app.instance

The middleware functions run in the specified order before the http routes

### index.ts
```typescript
import * as http from 'http';
import App from '@julian5335/spring-boot-node'
import UserController from './controllers/user.controller'

const controllers = [ UserController ]
const app = new App(controllers)

const PORT = 3000;
const server = http.createServer(app.instance);
server.listen(PORT, () => {
    console.log(`Server is listening on :${PORT}`);
});
```

## Note: Add "experimentalDecorators": true

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "experimentalDecorators": true
  }
}
```
