import * as openidClient from "openid-client";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";
import memoize from "memoizee";
import { storage } from "./storage";
import express, { Express, Request, Response, NextFunction } from "express";

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.SESSION_SECRET
) {
  throw new Error("Google client credentials or session secret not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await openidClient.Issuer.discover("https://accounts.google.com");
  },
  { maxAge: 3600 * 1000 }
);

function getSession(): express.RequestHandler {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  let sessionStore;
  if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
    sessionStore = undefined;
  } else if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }
  return session({
    secret: process.env.SESSION_SECRET as string,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(user: any, tokens: any): void {
  user.claims = typeof tokens.claims === "function" ? tokens.claims() : {};
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any): Promise<void> {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["given_name"],
    lastName: claims["family_name"],
    profileImageUrl: claims["picture"],
  });
}

async function setupAuth(app: Express): Promise<void> {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const issuer = await getOidcConfig();
  const clientInstance = new issuer.Client({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uris: [process.env.GOOGLE_CALLBACK_URL || ""],
    response_types: ["code"],
  });

  const verify = async (
    tokens: any,
    userinfo: any,
    done: (err: any, user?: any) => void
  ): Promise<void> => {
    const user: any = {};
    updateUserSession(user, tokens);
    await upsertUser(user.claims);
    done(null, user);
  };

  passport.use(
    "google",
    new openidClient.Strategy(
      {
        client: clientInstance,
        params: {
          scope: "openid email profile",
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        },
        passReqToCallback: false,
      },
      verify
    )
  );

  passport.serializeUser((user: any, cb: (err: any, id?: any) => void) => cb(null, user));
  passport.deserializeUser((user: any, cb: (err: any, user?: any) => void) => cb(null, user));

  app.get("/api/login", passport.authenticate("google"));

  app.get("/api/callback", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.redirect("/api/login");
      req.session.regenerate((sessionErr: any) => {
        if (sessionErr) return next(sessionErr);
        req.logIn(user, (loginErr: any) => {
          if (loginErr) return next(loginErr);
          req.session.save((saveErr: any) => {
            if (saveErr) return next(saveErr);
            res.redirect("/");
          });
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req: Request, res: Response) => {
    (req as any).logout();
    const redirectUrl =
      process.env.GOOGLE_LOGOUT_REDIRECT_URL || "/";
    res.redirect(
      issuer.end_session_endpoint
        ? `${issuer.end_session_endpoint}?post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`
        : "/"
    );
  });
}

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as any;
  if (!req.isAuthenticated() || !user?.expires_at) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const issuer = await getOidcConfig();
    const clientInstance = new issuer.Client({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    });
    const tokenSet = await clientInstance.refresh(refreshToken);
    updateUserSession(user, tokenSet);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export { setupAuth, isAuthenticated, getSession };