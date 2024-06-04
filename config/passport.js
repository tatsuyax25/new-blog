const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Correct path to the User model

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        // Updated function parameters
        try {
          // Ensure all fields are populated correctly
          const googleId = profile.id;
          const displayName = profile.displayName || "";
          const firstName =
            profile.name?.givenName ||
            (profile.displayName ? profile.displayName.split(" ")[0] : "");
          const lastName =
            profile.name?.familyName ||
            (profile.displayName
              ? profile.displayName.split(" ").slice(-1).join(" ")
              : "");
          const image =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : "";

          if (!googleId || !displayName || !firstName || !lastName) {
            throw new Error("Required profile information is missing.");
          }

          const newUser = {
            googleId,
            displayName,
            firstName,
            lastName,
            image,
          };

          let user = await User.findOne({ googleId });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
