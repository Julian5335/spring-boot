import { Request, Response } from 'express';
import Controller from './core/decorators/controller';
import { Delete, Get, Post, Put } from './core/decorators/methods';

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
}