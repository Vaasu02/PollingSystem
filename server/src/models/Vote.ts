import mongoose, { Schema } from 'mongoose';
import { IVote } from '../types/vote.types';

const VoteSchema = new Schema<IVote>({
  pollId: {
    type: String,
    required: true,
    ref: 'Poll',
  },
  optionId: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentSessionId: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  pollQuestion: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
}, {
  timestamps: false,
});

VoteSchema.index({ pollId: 1, studentSessionId: 1 }, { unique: true });
VoteSchema.index({ pollId: 1 });
VoteSchema.index({ studentSessionId: 1 });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);

