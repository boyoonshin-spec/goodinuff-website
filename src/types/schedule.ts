export type ScheduleItemDTO = {
  id: string;
  title: string;
  memo: string | null;
  date: string;
  time: string | null;
  isTodo: boolean;
  completed: boolean;
  remindKakao: boolean;
  remindMinutesBefore: number;
  reminderSentAt: string | null;
};
