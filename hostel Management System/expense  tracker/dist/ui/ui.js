export class UI {
    constructor(servive) {
        this.servive = servive;
        this.editingTxnId = null;
        this.form = document.getElementById("transaction-form");
        this.categorySelect = document.getElementById("category");
        this.tableBody = document.getElementById("transaction-table-body");
        this.init();
    }
    init() {
        this.populateCategoryDropdown();
        this.handleFormSubmit();
        this.render();
    }
    populateCategoryDropdown() {
        this.categorySelect.innerHTML =
            '<option value="" disabled selected>Select Category</option>';
        this.servive.getCategories().forEach((cat) => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            this.categorySelect.append(opt);
        });
    }
    render() {
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
    deleteTxn(id) {
        if (confirm("Delete this one?")) {
            this.servive.removeTransaction(id);
            this.render();
        }
    }
    editTxn(id) {
        const txn = this.servive.getTransactions().find((t) => t.id === id);
        if (!txn)
            return;
        this.editingTxnId = id;
        document.getElementById("amount").value =
            txn.amount.toString();
        document.getElementById("date").value = txn.date;
        this.categorySelect.value = txn.category.id;
        const radio = this.form.querySelector(`input[value="${txn.type}"]`);
        if (radio)
            radio.checked = true;
        this.form.querySelector("button").textContent = "Update Transaction";
    }
    handleFormSubmit() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            const amount = Number(document.getElementById("amount").value);
            const categoryId = this.categorySelect.value;
            const category = this.servive
                .getCategories()
                .find((c) => c.id === categoryId);
            const date = document.getElementById("date").value;
            const type = this.form.querySelector('input[name="transactionType"]:checked').value;
            if (!category)
                return;
            if (this.editingTxnId) {
                this.servive.updateTransaction(this.editingTxnId, {
                    amount,
                    type,
                    category,
                    date,
                });
                this.editingTxnId = null;
                this.form.querySelector("button").textContent = "Add Transaction";
            }
            else {
                this.servive.addTransaction(amount, type, category, date);
            }
            this.form.reset();
            this.render();
        });
    }
}
