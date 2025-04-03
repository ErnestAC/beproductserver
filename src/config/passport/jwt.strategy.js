// src/config/passport/jwt.strategy.js
import dotenv from "dotenv";
dotenv.config(); //  Make sure .env is loaded before using it

import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../../persistence/mongo/models/user.model.js";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken()
  ]),
  secretOrKey: process.env.JWT_SECRET, //  Should now always be defined
};

const strategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // console.log(" User authenticated:", payload);

    const user = await User.findById(payload.id);
    if (user) {
      console.log(" Fetched user from DB:", user.email);
      return done(null, user);
    }

    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
});

passport.use("jwt", strategy);
