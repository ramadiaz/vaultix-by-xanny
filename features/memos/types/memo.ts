export type Memo = {
  uid: string;
  title: string;
  content: string;
  memoTime: number;
  memoDate: string;
  pinned: boolean;
  pinnedTime: number | null;
  orderSeq: number;
  color: string | null;
  isDel: boolean;
  utime: number;
};
