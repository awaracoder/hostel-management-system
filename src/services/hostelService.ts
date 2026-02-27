import { Resident } from "../model/residents";
import { Rooms } from "../model/rooms";

export class hostelService {
  private rooms: Rooms[] = [];
  private resident: Resident[] = [];
  constructor() {}
  loadData(): void {
    const storedRooms = localStorage.getItem("rooms");
    const storedResidents = localStorage.getItem("residents");
    console.log(storedRooms);
    console.log(storedResidents);
  }
}