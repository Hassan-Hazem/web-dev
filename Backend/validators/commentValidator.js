import Joi from "joi";

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().required().messages({
    "string.empty": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 5000 characters",
    "any.required": "Comment content is required",
  }),
  postId: Joi.string().required().messages({
    "any.required": "Post ID is required",
  }),
  parentCommentId: Joi.string().optional().allow(null).messages({
    "string.base": "Parent comment ID must be a string",
  }),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().required().messages({
    "string.empty": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 5000 characters",
    "any.required": "Comment content is required",
  }),
});

export const voteCommentSchema = Joi.object({
  voteType: Joi.string().valid("up", "down").required().messages({
    "any.only": "Vote type must be 'up' or 'down'",
    "any.required": "Vote type is required",
  }),
});
