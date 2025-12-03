import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(300).trim().required().messages({
    "string.empty": "Title cannot be empty",
    "string.max": "Title cannot exceed 300 characters",
  }),
  content: Joi.string().allow("").optional(),
  postType: Joi.string().valid("text", "image", "link").default("text"),
  communityName: Joi.string().required().messages({
    "any.required": "Community name is required",
  }),
  imageUrl: Joi.string().allow("").optional(), 
});

export const voteSchema = Joi.object({
  voteType: Joi.string().valid("up", "down").required(),
});