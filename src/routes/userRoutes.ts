import { Router } from 'express';
import userCtrl from '../controllers/userController';
import auth from '../middlewares/auth';

const router: Router = Router();

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/users', auth, userCtrl.getUsers);

export default router;
