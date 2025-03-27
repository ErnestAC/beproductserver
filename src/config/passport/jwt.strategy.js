import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../../persistence/mongo/models/user.model.js";

// Extract token from Authorization header or cookies
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
    secretOrKey: process.env.JWT_SECRET || "your_jwt_secret_key"
};

const strategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
            if (payload && payload.id) {
                const user = await User.findById(payload.id);
                if (user) return done(null, user);
            }
            return done(null, false);
    } catch (err) {
            return done(err, false);
    }
});

passport.use("jwt", strategy);
