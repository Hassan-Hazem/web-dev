import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  createUser,
  findUserByGoogleId,
  findUserByEmail,
} from "../repositories/userRepository.js";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findUserByGoogleId(profile.id);
        if (user) {
          return done(null, user);
        }
        //if a user signed up with email/password before, we link their Google account
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
        const newUsername =
          profile.displayName.split(" ").join("") +
          Math.floor(Math.random() * 10000);
        user = await createUser({
          username: newUsername,
          email: profile.emails[0].value, //gets the gmail address
          googleId: profile.id,
          profilePictureUrl: profile.photos[0].value, //gets the profile picture used on the google account
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
