//passport.config.js
import passport from "passport";

// Load strategies
import "./jwt.strategy.js";
import "./local.strategy.js";

export default passport;
