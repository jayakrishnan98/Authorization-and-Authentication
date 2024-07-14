const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
import { Request, Response } from 'express';
import User from '../models/user';
import { user } from 'shared/commonInterfaces';


const userCtrl = {
  getUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error || 'Something Went Wrong!' });
    }
  },
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findOne({ email });

      // data checks
      if (user) return res.status(400).json({ msg: "This Email already Exists" });
      if (password.length < 6) return res.status(400).json({ msg: "Password is at least 6 characters long" });

      // Password Encryption
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new User({
        name, email, password: passwordHash
      });

      // save to MongoDB
      await newUser.save();

      // jsonwebtoken for authentication
      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      res.json({ status: "success", message: "Successfully Registered User", data: { accessToken } });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: error || "Something Went Wrong!" });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      let { email, password } = req?.body;

      const user: user | null = await User.findOne({ email });
      if (!user) return res.status(400).json({ status: 'failure', message: "User doesn't exist!" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ status: 'failure', message: "Incorrect Password!" });

      // login success
      const accessToken = await createAccessToken({ id: user._id });
      const refreshToken = await createRefreshToken({ id: user._id });

      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      res.json({ status: "success", message: "Successfully Logged In", data: { accessToken } });
    } catch (error: any) {
      res.status(500).json({ status: 'Failure', message: error.message || "Something Went Wrong!" });
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
      return res.json({ msg: "Logged out" })
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: error || "Something Went Wrong!" });
    }
  },
  refreshToken: async (req: Request, res: Response) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) return res.status(403).json({ msg: "Please Login or Register" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, ((err: any, user: user) => {
        if (err) return res.status(403).json({ msg: "Please Login or Register" });

        const accessToken = createAccessToken({ id: user._id });

        res.json({ accessToken });
      }));
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: error || "Something Went Wrong!" });
    }
  },
  getUser: async (req: Request, res: Response): Promise<void> => {

  },

}

const createAccessToken = (user: any) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '11m' })
}
const createRefreshToken = (user: any) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export default userCtrl;
