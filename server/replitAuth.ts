// Replit Auth integration based on blueprint:javascript_log_in_with_replit
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  
  // Use MemoryStore in development/test if DATABASE_URL is not available
  if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
    // Use default MemoryStore for development/testing
    sessionStore = undefined;
  } else if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // Create sessions table if missing in dev/test
      ttl: sessionTtl,
      tableName: "sessions",
    });
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  // Add localhost strategies for development/testing
  if (process.env.NODE_ENV !== 'production') {
    const localhostHosts = ['localhost', '127.0.0.1'];
    for (const host of localhostHosts) {
      const devStrategy = new Strategy(
        {
          name: `replitauth:${host}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `http://${host}:5000/api/callback`,
        },
        verify,
      );
      passport.use(devStrategy);
    }
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Normalize hostnames and provide fallback for testing
    let hostname = req.hostname;
    if (hostname === '::1') {
      hostname = '127.0.0.1';
    }
    
    // Try original hostname first, then fallback to localhost for dev/test
    const possibleStrategies = [`replitauth:${hostname}`, 'replitauth:localhost', 'replitauth:127.0.0.1'];
    let strategyName = possibleStrategies[0];
    
    // Use fallback strategy for dev/test if original hostname not configured
    if (process.env.NODE_ENV !== 'production' && !process.env.REPLIT_DOMAINS?.split(',').includes(hostname)) {
      strategyName = possibleStrategies.find(name => 
        process.env.REPLIT_DOMAINS?.split(',').includes(name.replace('replitauth:', '')) || 
        name.includes('localhost') || name.includes('127.0.0.1')
      ) || 'replitauth:localhost';
    }
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.redirect("/api/login");
      
      // Regenerate session ID before establishing login to prevent session fixation
      req.session.regenerate((sessionErr: any) => {
        if (sessionErr) return next(sessionErr);
        
        // Log in the user on the new session
        req.logIn(user, (loginErr: any) => {
          if (loginErr) return next(loginErr);
          
          // Save session and redirect
          req.session.save(() => {
            res.redirect("/");
          });
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
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
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};