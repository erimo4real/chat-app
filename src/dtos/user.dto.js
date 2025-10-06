// src/dtos/user.dto.js
class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.nickname = user.nickname;
    this.email = user.email;
    this.gender = user.gender || null;
    this.profileAsset = user.profileAsset || null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

module.exports = UserDTO;
