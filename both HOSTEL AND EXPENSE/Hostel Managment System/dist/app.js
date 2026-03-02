import { hostelService } from "./services/hostelService.js";
import { UI } from "./ui/ui.js";
const data = new hostelService();
console.log("here", data);
new UI(data);
