import mongoose, { Schema } from 'mongoose';
import { ISession } from '../types/user.types';

const SessionSchema = new Schema<ISession>({
  sessionId: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['teacher', 'student'],
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  currentPollId: {
    type: String,
    ref: 'Poll',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  socketId: {
    type: String,
  },
}, {
  timestamps: false,
});

SessionSchema.index({ sessionId: 1 }, { unique: true });
SessionSchema.index({ socketId: 1 });
SessionSchema.index({ currentPollId: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);

