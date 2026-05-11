import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  MERCHANT = 'merchant'
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  walletBalance: number;
  
  // Merchant specific fields
  merchantId?: string;
  storeName?: string;
  
  // Student specific fields
  studentId?: string;
  points?: number;
  streak?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.STUDENT,
    required: true 
  },
  walletBalance: { type: Number, default: 0 },
  
  // Merchant specific fields
  merchantId: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows multiple null/undefined values without violating the unique index
    required: function(this: any) { return this.role === UserRole.MERCHANT; } 
  },
  storeName: { 
    type: String,
    required: function(this: any) { return this.role === UserRole.MERCHANT; }
  },
  
  // Student specific fields
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    required: function(this: any) { return this.role === UserRole.STUDENT; }
  },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
