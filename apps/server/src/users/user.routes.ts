import express from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '@/middleware';
import { UserController } from './user.controller';

const fiveMinutesInMs = 5 * 60 * 1000;
const authLimiter = rateLimit({
  windowMs: fiveMinutesInMs,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

export const userRouter = express.Router();
const controller = new UserController();

userRouter.get('/', auth, controller.getCurrentUser.bind(controller));
userRouter.post('/', authLimiter, controller.registerUser.bind(controller));
userRouter.put('/', auth, controller.updateUser.bind(controller));
userRouter.delete('/', auth, controller.deleteUser.bind(controller));

userRouter.post('/login', authLimiter, controller.login.bind(controller));
userRouter.put('/changePassword', auth, controller.changePassword.bind(controller));
userRouter.post('/forgotPassword', authLimiter, controller.forgotPassword.bind(controller));
userRouter.post('/checkCode', authLimiter, controller.checkResetCode.bind(controller));

userRouter.get('/favorites', auth, controller.getFavorites.bind(controller));
userRouter.put('/favorites', auth, controller.addFavorite.bind(controller));
userRouter.delete('/favorites', auth, controller.removeFavorite.bind(controller));

userRouter.get('/unseen', auth, controller.getUnseenMovies.bind(controller));
userRouter.get('/seen', auth, controller.getSeenMovies.bind(controller));
userRouter.put('/seen', auth, controller.markAsSeen.bind(controller));
userRouter.delete('/seen', auth, controller.removeFromSeen.bind(controller));

userRouter.get('/watchlist', auth, controller.getWatchlist.bind(controller));
userRouter.put('/watchlist', auth, controller.addToWatchlist.bind(controller));
userRouter.delete('/watchlist', auth, controller.removeFromWatchlist.bind(controller));

userRouter.get('/rate', auth, controller.getRatings.bind(controller));
userRouter.put('/rate', auth, controller.rateMovie.bind(controller));
userRouter.delete('/rate', auth, controller.deleteRating.bind(controller));

userRouter.post('/filteredMovies', auth, controller.getFilteredMovies.bind(controller));
