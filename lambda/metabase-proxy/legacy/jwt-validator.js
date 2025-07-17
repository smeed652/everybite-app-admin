const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");

// Initialize JWKS client for Cognito
const client = jwksRsa({
  jwksUri: `https://cognito-idp.us-west-1.amazonaws.com/us-west-1_HuVwywmH1/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Get the signing key from JWKS
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Validate JWT token
async function validateJWT(token) {
  return new Promise((resolve, reject) => {
    const options = {
      algorithms: ["RS256"],
      issuer: `https://cognito-idp.us-west-1.amazonaws.com/us-west-1_HuVwywmH1`,
    };

    // Add audience validation if COGNITO_APP_CLIENT_ID is set
    if (process.env.COGNITO_APP_CLIENT_ID) {
      options.audience = process.env.COGNITO_APP_CLIENT_ID;
    }

    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

// Extract and validate token from Authorization header
async function validateAuthHeader(authHeader) {
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  // Support both "Bearer" and "ApiKey" prefixes for backward compatibility
  const token = authHeader.replace(/^(Bearer|ApiKey)\s+/i, "");

  if (!token) {
    throw new Error("Invalid Authorization header format");
  }

  try {
    const decoded = await validateJWT(token);
    return decoded;
  } catch (error) {
    throw new Error(`JWT validation failed: ${error.message}`);
  }
}

// Check if user has required role
function hasRole(decodedToken, requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement
  }

  const userGroups = decodedToken["cognito:groups"] || [];
  return requiredRoles.some((role) => userGroups.includes(role));
}

module.exports = {
  validateJWT,
  validateAuthHeader,
  hasRole,
};
