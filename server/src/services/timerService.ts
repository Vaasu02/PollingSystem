import { IPoll } from '../types/poll.types';

export class TimerService {
  static calculateRemainingTime(poll: IPoll): number | null {
    if (poll.status !== 'active' || !poll.startTime || !poll.endTime) {
      return null;
    }

    const now = new Date();
    const endTime = new Date(poll.endTime);
    const remaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);

    return Math.max(0, remaining);
  }

  static isPollExpired(poll: IPoll): boolean {
    if (poll.status !== 'active' || !poll.endTime) {
      return false;
    }

    const now = new Date();
    return now > poll.endTime;
  }

  static getTimerForStudent(poll: IPoll): number {
    if (poll.status !== 'active' || !poll.startTime) {
      return 0;
    }

    const now = new Date();
    const startTime = new Date(poll.startTime);
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const remaining = poll.duration - elapsed;

    return Math.max(0, remaining);
  }
}

