import { trackerService } from "./services/service.js";
import { UI } from "./ui/ui.js";

const service = new trackerService();
(window as any).ui = new UI(service);
// service.addTransaction(
//   2500,
//   "credit",
//   { id: "105", name: "income" },
//   "02032026",
// );
// service.addTransaction(2500, "debit", { id: "102", name: "food" }, "02032026");
// console.log(service.getStats());
// console.log(service.getTransactions());
