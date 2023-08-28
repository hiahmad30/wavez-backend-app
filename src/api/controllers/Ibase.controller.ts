import { Request, Response } from "express";

export interface IBaseController {
    list(req: Request, res: Response): void;
    add(req: Request, res: Response): void;
    update(req: Request, res: Response): void;
    delete(req: Request, res: Response): void;
}
