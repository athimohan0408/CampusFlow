import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description: string;
    category: 'technical' | 'cultural' | 'sports' | 'placement' | 'workshop' | 'other';
    date: Date;
    venue: string;
    organizer: mongoose.Types.ObjectId; // Reference to User (Admin)
    registrationLimit?: number;
    posterUrl?: string;
    tags: string[];
    allowedCourses?: string[];
    allowedDepartments?: string[];
    allowedYears?: number[];
    status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';

    // Enabled Modules
    modules: {
        registration: boolean;
        ticketing: boolean;
        teamFormation: boolean;
        attendance: boolean;
        feedback: boolean;
    };

    // Stats - Denormalized for performance? Or compute on fly?
    // Let's keep it simple for now.

    createdAt: Date;
    details?: Record<string, any>;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['technical', 'cultural', 'sports', 'placement', 'workshop', 'other'],
        required: true
    },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationLimit: { type: Number },
    posterUrl: { type: String },
    tags: [{ type: String }],
    allowedCourses: [{ type: String }],
    allowedDepartments: [{ type: String }],
    allowedYears: [{ type: Number }],
    status: {
        type: String,
        enum: ['draft', 'published', 'ongoing', 'completed', 'archived'],
        default: 'draft'
    },
    modules: {
        registration: { type: Boolean, default: true },
        ticketing: { type: Boolean, default: false },
        teamFormation: { type: Boolean, default: false },
        attendance: { type: Boolean, default: true },
        feedback: { type: Boolean, default: false },
    },
    details: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

// Add text index for search
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default Event;
