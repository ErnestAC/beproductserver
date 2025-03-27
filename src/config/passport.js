import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../persistence/mongo/models/user.model.js";
import bcrypt from "bcryptjs";

// Local Strategy for login (email & password)
passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: "Incorrect password" });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

// Serialize user ID into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user ID from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
