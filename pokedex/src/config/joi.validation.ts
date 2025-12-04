import * as Joi from "joi";


export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.string().required(),
    PORT: Joi.number().required().default(3005),
    DEFAULT_LIMIT: Joi.number().default(7),
})