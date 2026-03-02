import { Category } from "./category.js";

export interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  category: Category;
  date: string;
}
