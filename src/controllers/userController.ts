import { Request, Response } from 'express';
import User from '../models/user';

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error || 'Something Went Wrong!' });
  }
};

export { getUsers };
