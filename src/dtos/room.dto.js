// src/dtos/room.dto.js
class RoomDTO {
  constructor({ _id, name, participants, createdAt }) {
    this.id = _id;
    this.name = name;
    this.participants = participants || [];
    this.createdAt = createdAt;
  }
}

module.exports = RoomDTO;
