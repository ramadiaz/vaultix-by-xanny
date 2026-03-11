export type Budget = {
  uid: string;
  targetUid: string;
  doType: number;
  periodType: number;
  isTotal: boolean;
  transferType: number;
  orderSeq: number;
  isDel: boolean;
  modifyDate: number;
};

export type BudgetAmount = {
  uid: string;
  budgetUid: string;
  amount: number;
  budgetPeriod: number;
  isDel: boolean;
  modifyDate: number;
};
