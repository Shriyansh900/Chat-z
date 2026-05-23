/**
 * User-related API helpers
 * Endpoints from apiCollection.json — /users section
 */
import api from './axios';
import { User } from '@/types';

/** GET /users/:userId — get a user's public profile by ID */
export const getUserById = (userId: string) =>
  api.get<User>(`/users/${userId}`).then((r) => r.data);

/** GET /users/:userId/public-key — get another user's RSA public key for E2E */
export const getUserPublicKey = (userId: string) =>
  api
    .get<{ publicKey: string }>(`/users/${userId}/public-key`)
    .then((r) => r.data);

/** POST /users/me/public-key — register own RSA public key */
export const uploadPublicKey = (publicKey: string) =>
  api.post('/users/me/public-key', { publicKey }).then((r) => r.data);

/** GET /users/me/blocked — get list of blocked users */
export const getBlockedUsers = () =>
  api.get<User[]>('/users/me/blocked').then((r) => r.data);

/** POST /users/:userId/block — block a user */
export const blockUser = (userId: string) =>
  api.post(`/users/${userId}/block`).then((r) => r.data);

/** DELETE /users/:userId/block — unblock a user */
export const unblockUser = (userId: string) =>
  api.delete(`/users/${userId}/block`).then((r) => r.data);
