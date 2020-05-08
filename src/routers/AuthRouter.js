import express from "express";
import passport from "passport";
import * as AuthUtils from '../auth/auth-utils';
import { body, validationResult } from 'express-validator';
import RefreshToken from '../models/refresh-token-model';
import '../auth/passport-config';
const router = express();

router.post('/register', registerValidators(), async (req, res) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));

    passport.authenticate('register', { session: false },
        async (error, user) => {
            if (!user) return res.status(400).json({ errors: [error] });

            const refreshToken = await AuthUtils.createRefreshToken(user);
            res.cookie('accessToken', AuthUtils.createAccessToken(user), { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });
            res.sendStatus(200);
        }
    )(req, res);
});

router.post('/login', loginValidators(), async (req, res, next) => {
    if (validationResult(req).errors.length > 0)
        return res.status(400).json(validationResult(req));
    passport.authenticate('login', async (error, user) => {
        if (!user) return res.status(400).json({ errors: [error] });

        const refreshTokenDoc = await RefreshToken.findOne({ userId: user._id });
        res.cookie('accessToken', AuthUtils.createAccessToken(user), { httpOnly: true });
        res.cookie('refreshToken', refreshTokenDoc.token, { httpOnly: true });
        return res.sendStatus(200);
    })(req, res, next);
});

function registerValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty'),
        body('firstName').notEmpty().withMessage('cannot be empty'),
        body('lastName').notEmpty().withMessage('cannot be empty')
    ];
}

function loginValidators() {
    return [
        body('email').notEmpty().withMessage('cannot be empty').bail()
            .isEmail().withMessage('must have email format'),
        body('password').notEmpty().withMessage('cannot be empty')
    ];
}

export default router;