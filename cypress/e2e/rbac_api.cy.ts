/// <reference types="cypress" />
import { expect } from "chai";

// RBAC API-level smoke tests for /api/users
// We construct unsigned JWTs with minimal payloads; server only decodes, no verification.

const header = "e30"; // base64url-encoded '{}'
const payloadAdmin = "eyJjb2duaXRvOmdyb3VwcyI6WyJBRE1JTiJdfQ"; // {"cognito:groups":["ADMIN"]}
const payloadUser = "eyJjb2duaXRvOmdyb3VwcyI6WyJVU0VSIl19"; // {"cognito:groups":["USER"]}

const tokenAdmin = `${header}.${payloadAdmin}.`;
const tokenUser = `${header}.${payloadUser}.`;

describe("RBAC middleware – /api/users", () => {
  it("returns 403 for non-admin token", () => {
    cy.request({
      url: "/api/users",
      headers: { Authorization: `Bearer ${tokenUser}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body).to.have.property("error", "Forbidden");
    });
  });

  it("returns 200 and list for admin token", () => {
    cy.request({
      url: "/api/users",
      headers: { Authorization: `Bearer ${tokenAdmin}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("users").and.be.an("array");
    });
  });
});
