const userModel = require("../models/user-model");

class UserService {
  async getUserByUnEm(username, email) {
    const userByuserName = await userModel.findOne({ username });
    const userByEmail = await userModel.findOne({ email });
    return { userByuserName, userByEmail };
  }
  async getUserByEmail(email) {
    return await userModel.findOne({ email: email });
  }
  async createUser(user) {
    const { username, email, hashedPassword, role } = user;
    if(!role){
      return await userModel.create({
        username,
        email,
        password: hashedPassword,
        activated: true
      });
    }
    return await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
  }
  async getUsersByRole(role){
    return await userModel.find({role});
  }
}
module.exports = new UserService();
