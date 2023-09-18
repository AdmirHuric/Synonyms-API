import { Request, Response, NextFunction } from 'express';

const toLowerCase = (key: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        ['word', 'synonym'].forEach((item) => {
            if (req[key as keyof Request][item]) {
                req[key as keyof Request][item] = req[key as keyof Request][item].trim().toLowerCase();
            }
        });
        next();
    };
};

export { toLowerCase };
