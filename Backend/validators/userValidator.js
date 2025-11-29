import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^(?!.*jana).*$/i) 
    .required()
    .messages({
      'string.base': 'Username must be a text string',
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username should have a minimum length of 3',
      'string.pattern.base': 'Username cannot contain the word "jana"',
      'any.required': 'Username is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?!.*jana).*$/i) 
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password cannot contain the word "jana"',
      'any.required': 'Password is required'
    })
});

export const loginSchema = Joi.object({
  loginIdentifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Username or Email is required to login'
    }),

  password: Joi.string()
    .pattern(/^(?!.*jana).*$/i) // Also apply rule to login password
    .required()
    .messages({
      'string.pattern.base': 'Password cannot contain the word "jana"',
      'any.required': 'Password is required'
    })
});
