import { trackerService } from "../services/service";

export class UI {
  private form: HTMLFormElement;
  private categorySelect: HTMLSelectElement;
  private tableBody: HTMLTableSectionElement;
  private editingTxnId: string | null = null;

  constructor(private servive: trackerService) {
    this.form = document.getElementById("transaction-form") as HTMLFormElement;
    this.categorySelect = document.getElementById(
      "category",
    ) as HTMLSelectElement;
    this.tableBody = document.getElementById(
      "transaction-table-body",
    ) as HTMLTableSectionElement;
    this.init();
  }

  private init(): void {
    this.populateCategoryDropdown();
    this.handleFormSubmit();
    this.render();
  }

  private populateCategoryDropdown(): void {
    this.categorySelect.innerHTML =
      '<option value="" disabled selected>Select Category</option>';
    this.servive.getCategories().forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      this.categorySelect.append(opt);
    });
  }

  private render(): void {
    const stats = this.servive.getStats();
    const statsDiv = document.getElementById("stats-display");
    if (statsDiv) {
      statsDiv.innerHTML = `
        <p>Total Monthly Income: <span>₹${stats.monthlyBalance}</span></p>
        <p>Current Balance: <span>₹${stats.balance}</span></p>
      `;
    }

    this.tableBody.innerHTML = "";
    this.servive.getTransactions().forEach((txn) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>₹${txn.amount}</td>
        <td>${txn.type}</td>
        <td>${txn.category.name}</td>
        <td>${txn.date}</td>
        <td>
          <button class="editBtn" onclick="window.ui.editTxn('${txn.id}')">Edit</button>
          <button class="deleteBtn" onclick="window.ui.deleteTxn('${txn.id}')">Delete</button>
        </td>
      `;
      this.tableBody.appendChild(row);
    });
  }

  public deleteTxn(id: string) {
    if (confirm("Delete this one?")) {
      this.servive.removeTransaction(id);
      this.render();
    }
  }

  public editTxn(id: string) {
    const txn = this.servive.getTransactions().find((t) => t.id === id);
    if (!txn) return;

    this.editingTxnId = id;
    (document.getElementById("amount") as HTMLInputElement).value =
      txn.amount.toString();
    (document.getElementById("date") as HTMLInputElement).value = txn.date;
    this.categorySelect.value = txn.category.id;

    const radio = this.form.querySelector(
      `input[value="${txn.type}"]`,
    ) as HTMLInputElement;
    if (radio) radio.checked = true;

    this.form.querySelector("button")!.textContent = "Update Transaction";
  }

  private handleFormSubmit(): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = Number(
        (document.getElementById("amount") as HTMLInputElement).value,
      );
      const categoryId = this.categorySelect.value;
      const category = this.servive
        .getCategories()
        .find((c) => c.id === categoryId);
      const date = (document.getElementById("date") as HTMLInputElement).value;
      const type = (
        this.form.querySelector(
          'input[name="transactionType"]:checked',
        ) as HTMLInputElement
      ).value as "credit" | "debit";

      if (!category) return;

      if (this.editingTxnId) {
        this.servive.updateTransaction(this.editingTxnId, {
          amount,
          type,
          category,
          date,
        });
        this.editingTxnId = null;
        this.form.querySelector("button")!.textContent = "Add Transaction";
      } else {
        this.servive.addTransaction(amount, type, category, date);
      }

      this.form.reset();
      this.render();
    });
  }
}
