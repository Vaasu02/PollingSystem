import mongoose, { Schema } from 'mongoose';
import { IPoll, IOption } from '../types/poll.types';

const OptionSchema = new Schema<IOption>({
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: true,
    maxlength: 100,
  },
  options: {
    type: [OptionSchema],
    required: true,
    validate: {
      validator: (options: IOption[]) => options.length >= 2,
      message: 'Poll must have at least 2 options',
    },
  },
  duration: {
    type: Number,
    required: true,
    default: 60,
    min: 1,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended'],
    default: 'draft',
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  createdBy: {
    type: String,
    required: true,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

PollSchema.index({ status: 1 });
PollSchema.index({ createdBy: 1 });

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);

