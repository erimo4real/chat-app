// src/repositories/room.repository.js
const Room = require('../models/room.model'); // we’ll define this model later
const RoomDTO = require('../dtos/room.dto');

class RoomRepository {
  async findById(id) {
    const room = await Room.findById(id).populate('participants', 'nickname email');
    return room ? new RoomDTO(room) : null;
  }

  async findAll() {
    const rooms = await Room.find().populate('participants', 'nickname email');
    return rooms.map(r => new RoomDTO(r));
  }

  async create(data) {
    const room = await Room.create(data);
    return new RoomDTO(room);
  }
}

module.exports = new RoomRepository();
