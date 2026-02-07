import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
    event: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    status: 'registered' | 'waitlisted' | 'cancelled' | 'attended';
    attendedAt?: Date;
    teamName?: string;
    teamMembers?: mongoose.Types.ObjectId[];
    feedbackRating?: number;
    feedbackComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
        default: 'registered'
    },
    attendedAt: { type: Date },
    teamName: { type: String },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    feedbackRating: { type: Number, min: 1, max: 5 },
    feedbackComment: { type: String },
}, { timestamps: true });

// Prevent duplicate registration
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

const Registration: Model<IRegistration> = mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);
export default Registration;
