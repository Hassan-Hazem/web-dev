import Joi from "joi";

export const createCommunitySchema = Joi.object({
  name: Joi.string().min(3).max(30).trim().required().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 30 characters",
  }),
  description: Joi.string().max(500).required(),
  topics: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional().default(true),
});

export const updateCommunitySchema = Joi.object({
  description: Joi.string().max(500).optional(),
  coverPictureUrl: Joi.string().uri().allow("").optional(),
  profilePictureUrl: Joi.string().uri().allow("").optional(),
  topics: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional(),
});