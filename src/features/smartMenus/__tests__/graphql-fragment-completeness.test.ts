import { gql } from "@apollo/client";
import { describe, expect, it } from "vitest";

// Import the actual fragment from the smartMenus feature
import { WIDGET_BASIC_FIELDS } from "../graphql/fragments";

describe("SmartMenus GraphQL Fragment Completeness", () => {
  it("should include all required fields for the SmartMenus table", () => {
    // Define all the fields that the SmartMenus table expects
    const requiredFields = [
      "id",
      "name",
      "slug",
      "displayImages",
      "isSyncEnabled",
      "isOrderButtonEnabled",
      "orderUrl",
      "layout",
      "publishedAt",
      "updatedAt",
      "primaryBrandColor",
      "highlightColor",
    ];

    // Parse the fragment to extract field names
    const fragmentString = WIDGET_BASIC_FIELDS.loc?.source.body || "";

    // Extract field names from the fragment (simple regex approach)
    const fieldMatches = fragmentString.match(/(\w+)/g) || [];

    // Filter out GraphQL keywords and common words
    const graphqlKeywords = ["fragment", "WidgetFields", "on", "Widget"];
    const extractedFields = fieldMatches.filter(
      (field: string) => !graphqlKeywords.includes(field) && field.length > 1
    );

    // Check if all required fields are present
    const missingFields = requiredFields.filter(
      (field: string) => !extractedFields.includes(field)
    );

    if (missingFields.length > 0) {
      console.error("Missing fields in WidgetFields fragment:", missingFields);
      console.error("Available fields:", extractedFields);
      console.error("Fragment content:", fragmentString);
    }

    expect(missingFields).toHaveLength(0);
  });

  it("should have the correct fragment name", () => {
    const definition = WIDGET_BASIC_FIELDS.definitions[0];
    expect(definition.kind).toBe("FragmentDefinition");
    if (definition.kind === "FragmentDefinition") {
      expect(definition.name.value).toBe("WidgetBasicFields");
    }
  });

  it("should be a valid GraphQL fragment", () => {
    // This test will throw if the fragment is malformed
    expect(() => {
      const _ = gql`
        ${WIDGET_BASIC_FIELDS}
      `;
    }).not.toThrow();
  });
});
