import Joi from "joi";

export const postSchema = Joi.object({
  content: Joi.string().required(),
  media: Joi.object({
    key: Joi.array().items(Joi.string().required()).required(),
  }).optional(),
});

export const viewPost = Joi.object({
  post_id: Joi.string().required(),
});

export const likeComment = Joi.object({
  comment_id: Joi.string().required(),
});

export const rePostSchema = Joi.object({
  content: Joi.string().optional().default(""),
  media: Joi.object({
    key: Joi.array().items(Joi.string().required()).required(),
  }).optional(),
});

export const viewComment = Joi.object({
  post_id: Joi.string().required(),
  comment_id: Joi.string().required(),
});
