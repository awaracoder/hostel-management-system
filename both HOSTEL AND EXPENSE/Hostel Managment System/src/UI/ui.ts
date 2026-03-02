import { hostelService as service } from "../services/hostelService.js";

export class UI {
  private form: HTMLFormElement;
  private tableBody: HTMLTableSectionElement;
  private statsDiv: HTMLDivElement;
  private roomSelect: HTMLSelectElement;
  private submitBtn: HTMLButtonElement;
  private searchInput: HTMLInputElement;
  private editResidentId: string | null = null;

  constructor(private service: service) {
    this.form = document.getElementById("residentForm") as HTMLFormElement;
    this.tableBody = document.getElementById(
      "residentTableBody",
    ) as HTMLTableSectionElement;
    this.statsDiv = document.getElementById("stats") as HTMLDivElement;
    this.roomSelect = document.getElementById(
      "roomNumber",
    ) as HTMLSelectElement;
    this.submitBtn = this.form.querySelector(
      "button[type='submit']",
    ) as HTMLButtonElement;
    this.searchInput = document.getElementById(
      "searchResident",
    ) as HTMLInputElement;
    this.init();
  }

  private init(): void {
    this.populateRoomDropdown();
    this.renderResidents();
    this.renderStats();
    this.handleFormSubmit();
    this.handleTableClicks();
    this.handleSearch();
  }

  private populateRoomDropdown(currentRoomNumber?: number): void {
    this.roomSelect.innerHTML = "";
    const vacantRooms = this.service.getVacantRooms();

    let options = [...vacantRooms];
    if (currentRoomNumber) {
      const currentRoomObj = this.service.getRooms.find(
        (r) => r.roomNumber === currentRoomNumber,
      );
      if (
        currentRoomObj &&
        !options.find((r) => r.roomNumber === currentRoomNumber)
      ) {
        options.push(currentRoomObj);
      }
    }

    options.sort((a, b) => a.roomNumber - b.roomNumber);

    if (options.length === 0) {
      this.roomSelect.innerHTML = `<option disabled selected>No Vacant Rooms</option>`;
      return;
    }

    options.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.roomNumber.toString();
      option.textContent = `Room ${room.roomNumber}`;
      if (room.roomNumber === currentRoomNumber) option.selected = true;
      this.roomSelect.appendChild(option);
    });
  }

  private renderResidents(searchText: string = ""): void {
    this.tableBody.innerHTML = "";
    const residents = this.service.getResidents.filter((r) =>
      r.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    if (residents.length === 0) {
      this.tableBody.innerHTML = `<tr>
       <td colspan="7" style="text-align:center;">No residents found</td>
       </tr> `;
      return;
    }

    residents.forEach((resident) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><button data-id="${resident.id}" class="editBtn">✏️ Edit</button></td>
        <td>${resident.name}</td>
        <td>${resident.age}</td>
        <td>${resident.phone}</td>
        <td>${resident.roomNumber}</td>
        <td>${resident.checkIndate}</td>
        <td><button data-id="${resident.id}" class="deleteBtn">Delete</button></td>
      `;
      this.tableBody.appendChild(row);
    });
  }
  private handleSearch(): void {
    this.searchInput.addEventListener("input", () => {
      const query = this.searchInput.value;
      this.renderResidents(query);
    });
  }
  private renderStats(): void {
    const stats = this.service.getRoomStats();
    this.statsDiv.innerHTML = `
      <p>Total Rooms: <strong>${stats.total}</strong> | 
         Occupied: <span style="color: red;">${stats.occupied}</span> | 
         Vacant: <span style="color: green;">${stats.vacant}</span></p>
    `;
  }

  private handleFormSubmit(): void {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = (document.getElementById("name") as HTMLInputElement).value;
      const age = Number(
        (document.getElementById("age") as HTMLInputElement).value,
      );
      const phone = (document.getElementById("phone") as HTMLInputElement)
        .value;
      const roomNumber = Number(this.roomSelect.value);
      const checkInDate = (
        document.getElementById("checkInDate") as HTMLInputElement
      ).value;

      try {
        if (this.editResidentId) {
          //updaate
          this.service.updateResident(this.editResidentId, {
            name,
            age,
            phone,
            roomNumber,
            checkIndate: checkInDate,
          });
          this.editResidentId = null;
          this.submitBtn.textContent = "Add Resident";
          this.submitBtn.style.backgroundColor = ""; // Reset color
        } else {
          // add
          this.service.addResident(name, age, phone, roomNumber, checkInDate);
        }

        this.refreshAll();
        this.form.reset();
      } catch (error: any) {
        alert(error.message);
      }
    });
  }

  private handleTableClicks(): void {
    this.tableBody.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const id = target.getAttribute("data-id");

      if (!id) return;

      if (target.classList.contains("deleteBtn")) {
        if (confirm("Are you sure you want to delete this resident?")) {
          this.service.removeResident(id);
          this.refreshAll();
        }
      }

      if (target.classList.contains("editBtn")) {
        this.startEditing(id);
      }
    });
  }

  private startEditing(id: string): void {
    const resident = this.service.getResidents.find((r) => r.id === id);
    if (!resident) return;

    this.editResidentId = id;

    (document.getElementById("name") as HTMLInputElement).value = resident.name;
    (document.getElementById("age") as HTMLInputElement).value =
      resident.age.toString();
    (document.getElementById("phone") as HTMLInputElement).value =
      resident.phone;
    (document.getElementById("checkInDate") as HTMLInputElement).value =
      resident.checkIndate;

    this.populateRoomDropdown(resident.roomNumber);

    this.submitBtn.textContent = "Update Resident Info";
    this.submitBtn.style.backgroundColor = "#ffa500"; // Orange for edit mode

    this.form.scrollIntoView({ behavior: "smooth" });
  }

  private refreshAll(): void {
    this.searchInput.value = "";
    this.renderResidents();
    this.renderStats();
    this.populateRoomDropdown();
  }
}
