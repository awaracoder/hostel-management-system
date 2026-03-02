import { roomsAvailability } from "../data/roomsData.js";
export class hostelService {
    constructor() {
        this.rooms = [];
        this.resident = [];
        this.loadData();
    }
    //web storage->browser gives storage of 5mb in json formate. This is also a web API
    //!This is for loading data
    loadData() {
        const storedRooms = localStorage.getItem("rooms");
        const storedResidents = localStorage.getItem("residents");
        if (storedRooms) {
            this.rooms = JSON.parse(storedRooms);
        }
        else {
            this.rooms = roomsAvailability;
        }
        if (storedResidents) {
            this.resident = JSON.parse(storedResidents);
        }
        else {
            this.resident = [];
        }
    }
    //! Getters for rooms and residents
    get getRooms() {
        return this.rooms;
    }
    get getResidents() {
        return this.resident;
    }
    //!Storing the data
    saveData() {
        localStorage.setItem("rooms", JSON.stringify(this.rooms));
        localStorage.setItem("residents", JSON.stringify(this.resident));
    }
    //!Add Resident
    addResident(name, age, phone, roomNumber, checkInDate) {
        const room = this.rooms.find((r) => r.roomNumber === roomNumber); //== for checking only value and === for checking both vlaues and types
        if (!room) {
            throw new Error("Room doesn't exist");
        }
        else if (room.isOccupied) {
            throw new Error("Room is already occupied");
        }
        const newResident = {
            id: Date.now().toString(),
            name: name,
            age: age,
            phone: phone,
            roomNumber: roomNumber,
            checkIndate: checkInDate,
        };
        this.resident.push(newResident);
        room.isOccupied = true;
        this.saveData();
        console.log(this.rooms);
        console.log("added", this.resident);
    }
    // Delete resident
    removeResident(residentId) {
        const index = this.resident.findIndex((r) => r.id === residentId);
        if (index == -1) {
            throw new Error("Resident not found");
        }
        const room = this.rooms.find((r) => r.roomNumber === this.resident[index].roomNumber);
        if (!room) {
            throw new Error("Room doesn't exist");
        }
        room.isOccupied = false;
        this.resident.splice(index, 1);
        this.saveData();
    }
    // update resident
    updateResident(residentId, updatedData) {
        const index = this.resident.findIndex((r) => r.id === residentId);
        if (index === -1)
            throw new Error("Resident not found");
        const oldResident = this.resident[index];
        if (updatedData.roomNumber &&
            updatedData.roomNumber !== oldResident.roomNumber) {
            const newRoom = this.rooms.find((r) => r.roomNumber === updatedData.roomNumber);
            if (!newRoom || newRoom.isOccupied)
                throw new Error("New room unavailable");
            const oldRoom = this.rooms.find((r) => r.roomNumber === oldResident.roomNumber);
            if (oldRoom)
                oldRoom.isOccupied = false;
            newRoom.isOccupied = true;
        }
        this.resident[index] = Object.assign(Object.assign({}, oldResident), updatedData);
        this.saveData();
        console.log("updated", this.resident);
    }
    // get vacant rooms
    getVacantRooms() {
        return this.rooms.filter((r) => !r.isOccupied);
    }
    //get occupied rooms
    getOccupiedRooms() {
        return this.rooms.filter((r) => r.isOccupied);
    }
    getRoomStats() {
        const total = this.rooms.length;
        const occupied = this.getOccupiedRooms().length;
        const vacant = total - occupied;
        return { total, occupied, vacant };
    }
}
