import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';

// Example controller structure for User operations
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, merchantId, storeName, studentId } = req.body;
    
    // In a real app, hash password here
    // const passwordHash = await bcrypt.hash(password, 10);
    const passwordHash = password; // Placeholder

    const newUser = new User({
      name,
      email,
      passwordHash,
      role,
      merchantId: role === UserRole.MERCHANT ? merchantId : undefined,
      storeName: role === UserRole.MERCHANT ? storeName : undefined,
      studentId: role === UserRole.STUDENT ? studentId : undefined,
    });

    await newUser.save();

    res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
