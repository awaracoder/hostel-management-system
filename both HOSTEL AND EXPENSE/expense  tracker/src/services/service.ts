import { paymentCategory } from "../data/categoryData.js";
import { Category } from "../model/category.js";
import { Transaction } from "../model/transaction.js";

export class trackerService {
  private monthlyBalance: number = 0;
  private Balance: number = 0;
  private paymentCategories: Category[] = [];
  private transactions: Transaction[] = [];
  constructor() {
    this.loadData();
  }
  loadData(): void {
    this.monthlyBalance = Number(localStorage.getItem("monthlyBalance")) || 0;
    this.Balance = Number(localStorage.getItem("currentBalance")) || 0;

    const savedTxns = localStorage.getItem("transactions");
    this.transactions = savedTxns ? JSON.parse(savedTxns) : [];
    this.paymentCategories = paymentCategory;
  }
  private saveData() {
    localStorage.setItem("monthlyBalance", this.monthlyBalance.toString());
    localStorage.setItem("currentBalance", this.Balance.toString());
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }
  getMonthlyBalance() {
    return this.monthlyBalance;
  }
  getBalance() {
    return this.Balance;
  }
  getCategories() {
    return this.paymentCategories;
  }
  getTransactions() {
    return this.transactions;
  }
  private updateBalances(
    amount: number,
    type: "credit" | "debit",
    action: "add" | "remove",
  ) {
    const mod = action === "add" ? 1 : -1;

    if (type === "credit") {
      this.Balance += amount * mod;
      this.monthlyBalance += amount * mod;
    } else {
      this.Balance -= amount * mod;
    }
  }
  addTransaction(
    amount: number,
    type: "credit" | "debit",
    category: Category,
    date: string,
  ) {
    const cat = this.paymentCategories.find((r) => r.id === category.id);
    if (!cat) throw new Error("no category found");
    const newTxn: Transaction = {
      id: Date.now().toString(),
      category: category,
      amount: amount,
      type: type,
      date: date,
    };
    this.transactions.push(newTxn);
    this.updateBalances(amount, type, "add");
    this.saveData();
  }
  removeTransaction(transactionId: string) {
    const txnIndex = this.transactions.findIndex((t) => t.id == transactionId);
    if (txnIndex === -1) throw new Error("NO Such transaction exists");
    const txn = this.transactions[txnIndex];
    this.updateBalances(txn.amount, txn.type, "remove");
    this.transactions.splice(txnIndex, 1);
    this.saveData();
  }
  updateTransaction(
    transactionId: string,
    updatedFields: Partial<Transaction>,
  ) {
    const index = this.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) throw new Error("Transaction not found");

    const oldTxn = this.transactions[index];
    this.updateBalances(oldTxn.amount, oldTxn.type, "remove");

    this.transactions[index] = { ...oldTxn, ...updatedFields };

    const newTxn = this.transactions[index];
    this.updateBalances(newTxn.amount, newTxn.type, "add");

    this.saveData();
  }
  getStats() {
    const monthlyBalance = this.monthlyBalance;
    const balance = this.Balance;
    const transactionCount = this.transactions.length;
    return { monthlyBalance, balance, transactionCount };
  }
}
