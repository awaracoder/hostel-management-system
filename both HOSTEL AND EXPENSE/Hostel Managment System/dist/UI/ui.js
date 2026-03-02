export class UI {
    constructor(service) {
        this.service = service;
        this.editResidentId = null;
        this.form = document.getElementById("residentForm");
        this.tableBody = document.getElementById("residentTableBody");
        this.statsDiv = document.getElementById("stats");
        this.roomSelect = document.getElementById("roomNumber");
        this.submitBtn = this.form.querySelector("button[type='submit']");
        this.searchInput = document.getElementById("searchResident");
        this.init();
    }
    init() {
        this.populateRoomDropdown();
        this.renderResidents();
        this.renderStats();
        this.handleFormSubmit();
        this.handleTableClicks();
        this.handleSearch();
    }
    populateRoomDropdown(currentRoomNumber) {
        this.roomSelect.innerHTML = "";
        const vacantRooms = this.service.getVacantRooms();
        let options = [...vacantRooms];
        if (currentRoomNumber) {
            const currentRoomObj = this.service.getRooms.find((r) => r.roomNumber === currentRoomNumber);
            if (currentRoomObj &&
                !options.find((r) => r.roomNumber === currentRoomNumber)) {
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
            if (room.roomNumber === currentRoomNumber)
                option.selected = true;
            this.roomSelect.appendChild(option);
        });
    }
    renderResidents(searchText = "") {
        this.tableBody.innerHTML = "";
        const residents = this.service.getResidents.filter((r) => r.name.toLowerCase().includes(searchText.toLowerCase()));
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
    handleSearch() {
        this.searchInput.addEventListener("input", () => {
            const query = this.searchInput.value;
            this.renderResidents(query);
        });
    }
    renderStats() {
        const stats = this.service.getRoomStats();
        this.statsDiv.innerHTML = `
      <p>Total Rooms: <strong>${stats.total}</strong> | 
         Occupied: <span style="color: red;">${stats.occupied}</span> | 
         Vacant: <span style="color: green;">${stats.vacant}</span></p>
    `;
    }
    handleFormSubmit() {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const age = Number(document.getElementById("age").value);
            const phone = document.getElementById("phone")
                .value;
            const roomNumber = Number(this.roomSelect.value);
            const checkInDate = document.getElementById("checkInDate").value;
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
                }
                else {
                    // add
                    this.service.addResident(name, age, phone, roomNumber, checkInDate);
                }
                this.refreshAll();
                this.form.reset();
            }
            catch (error) {
                alert(error.message);
            }
        });
    }
    handleTableClicks() {
        this.tableBody.addEventListener("click", (event) => {
            const target = event.target;
            const id = target.getAttribute("data-id");
            if (!id)
                return;
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
    startEditing(id) {
        const resident = this.service.getResidents.find((r) => r.id === id);
        if (!resident)
            return;
        this.editResidentId = id;
        document.getElementById("name").value = resident.name;
        document.getElementById("age").value =
            resident.age.toString();
        document.getElementById("phone").value =
            resident.phone;
        document.getElementById("checkInDate").value =
            resident.checkIndate;
        this.populateRoomDropdown(resident.roomNumber);
        this.submitBtn.textContent = "Update Resident Info";
        this.submitBtn.style.backgroundColor = "#ffa500"; // Orange for edit mode
        this.form.scrollIntoView({ behavior: "smooth" });
    }
    refreshAll() {
        this.searchInput.value = "";
        this.renderResidents();
        this.renderStats();
        this.populateRoomDropdown();
    }
}
