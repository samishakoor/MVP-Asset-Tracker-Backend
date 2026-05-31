import Joi from 'joi';
import { UserRole } from '../constants/index.js';

const userRoleValues = Object.values(UserRole);

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().trim().min(6).max(255).required(),
  name: Joi.string().trim().min(1).max(255).required(),
  role: Joi.string()
    .valid(...userRoleValues)
    .optional(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().trim().min(1).max(255).optional(),
}).min(1);

export const updateMyProfileSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const assetIdParamForUserSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
});
