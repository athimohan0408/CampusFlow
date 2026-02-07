import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    password?: string;
    role: 'student' | 'admin' | 'super-admin';
    department?: string;
    year?: number;
    interests: string[];
    preferences: {
        eventCategories: string[];
        notifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: {
        type: String,
        enum: ['student', 'admin', 'super-admin'],
        default: 'student'
    },
    password: { type: String, select: false },
    department: { type: String },
    year: { type: Number },
    interests: [{ type: String }],
    preferences: {
        eventCategories: [{ type: String }],
        notifications: { type: Boolean, default: true },
    },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
