import express from 'express';
import { registerUser, verifyEmail, resendVerification } from '../../controllers/auth/RegisterController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
