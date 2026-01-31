import type { Request } from "express"
import { v4 } from "uuid"

export const fileNamer = (_req: Request, file: Express.Multer.File, callback: Function) => {

    if (!file)
        return callback(new Error('FIle is empty'), false)

    const fileExtension = file.mimetype.split('/')[1]

    const filename = `${v4()}.${fileExtension}`
    callback(null, filename)

}