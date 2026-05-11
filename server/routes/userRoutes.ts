import express from 'express';
import { registerUser, getUserProfile } from '../controllers/userController';

const router = express.Router();

router.post('/register', registerUser);
router.get('/profile/:id', getUserProfile);

export default router;
