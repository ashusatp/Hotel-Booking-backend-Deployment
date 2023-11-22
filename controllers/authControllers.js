const UserDto = require("../dtos/user-dto");
const refreshModel = require("../models/refresh-model");
const userModel = require("../models/user-model");
const hashService = require("../services/hash-service");
const tokenService = require("../services/token-service");
const userService = require("../services/user-service");

class AuthControlers {
  async register(req, res) {
    // geting user data
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }
    // if already username exist or email exist
    try {
      const { userByuserName, userByEmail } = await userService.getUserByUnEm(
        username,
        email
      );
      if (userByuserName) {
        return res.status(409).json({
          error: true,
          message: "user name already exist",
          success: false,
          data: {},
        });
      }
      if (userByEmail) {
        return res.status(409).json({
          error: true,
          message: "Email address already exist",
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 1",
        success: false,
        data: {},
      });
    }
    // // hash password
    const hashedPassword = await hashService.hashPassword(password);

    // create a user
    let user;
    try {
      user = await userService.createUser({
        username,
        email,
        hashedPassword,
        role,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 2",
        success: false,
        data: {},
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = tokenService.createToken({
      _id: user._id,
      role: user.role,
      activeted: user.activated,
      username: user.username,
    });

    try {
      await tokenService.storeRefreshToken(refreshToken, user._id);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 3",
        success: false,
        data: {},
      });
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });

    const userDto = new UserDto(user);
    res.status(200).json({
      error: false,
      message: "user registered successfully",
      success: true,
      data: {
        user: userDto,
        auth: true,
        activated: user.activated,
        role: user.role,
      },
    });
  }
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "The request is missing a required parameter",
        success: false,
        data: {},
      });
    }

    // finding user with provided email;
    let user;
    try {
      user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          error: true,
          message:
            "The provided email address does not exist in our system. Please check the email and try again.",
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 1",
        success: false,
        data: {},
      });
    }

    // compare password
    // // hash password
    const hashedPassword = await hashService.hashPassword(password);
    if (hashedPassword !== user.password) {
      return res.status(401).json({
        error: true,
        message:
          "Incorrect password. Please double-check your password and try again.",
        success: false,
        data: {},
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = tokenService.createToken({
      _id: user._id,
      role: user.role,
      activated: user.activated,
      username: user.username,
    });

    try {
      await tokenService.storeRefreshToken(refreshToken, user._id);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 3",
        success: false,
        data: {},
      });
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });

    const userDto = new UserDto(user);
    res.status(200).json({
      error: false,
      message: `welcome back  ${userDto.username}!!`,
      success: true,
      data: {
        user: userDto,
        auth: true,
        activated: user.activated,
        role: user.role,
      },
    });
  }
  async logout(req, res) {
    const { refreshToken } = req.cookies;
    try {
      await tokenService.deleteRefreshToken(refreshToken);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Db error 1",
        success: false,
        data: {},
      });
    }
    // delete cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      error: false,
      message: `logged out`,
      success: true,
      data: { user: null, auth: false },
    });
  }
  async refresh(req, res) {
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    let userData;
    try {
      userData = tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (error) {
      return res.status(401).json({ message: "invalid token1" });
    }
    // check if token is in database
    let token;
    try {
      token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Error" });
    }
    // check if valid user
    const user = await userModel.findById(userData._id);
    if (!user) {
      return res.status(404).json({ message: "No user" });
    }
    // generate new accesstoken and refresh token
    const { refreshToken, accessToken } = tokenService.createToken({
      _id: userData._id,
      role: user.role,
      activeted: user.activated,
      username: user.username,
    });

    // update refresh token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (error) {
      return res.status(500).json({ message: "Internal Error" });
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, //30 days
      sameSite: none,
      secure: true
    });

    const userDto = new UserDto(user);
    res.status(200).json({
      error: false,
      message: "user registered successfully",
      success: true,
      data: {
        user: userDto,
        auth: true,
        activated: user.activated,
        role: user.role,
      },
    });
  }
}
module.exports = new AuthControlers();
