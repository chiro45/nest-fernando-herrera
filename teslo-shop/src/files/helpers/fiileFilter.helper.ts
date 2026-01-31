import type { Request } from "express";


export const fileFilter = (_req: Request, file: Express.Multer.File, callback: Function) => {

    if (!file)
        return callback(new Error('File is empty'), false)
    if (!file.mimetype)
        return callback(new Error("File isn't mimetype "), false)

    const fileExtension = file.mimetype.split('/')[1]

    const validException = ['jpg', 'jpeg', 'png', 'gif']

    if (validException.includes(fileExtension)) {
        return callback(null, true)
    }

    callback(null, true)

}