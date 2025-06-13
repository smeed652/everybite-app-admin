# Product Requirements Document: EveryBite Admin (everybite.app.admin)

## 1. Introduction & Purpose

*   1.1. Project Overview
    *   The EveryBite Admin (everybite.app.admin) is a web-based administration panel designed to manage various elements of the EveryBite ecosystem. It interfaces with EveryBite's GraphQL API ([`https://api.everybite.com/graphql`](https://api.everybite.com/graphql), with documentation at [`https://api.everybite.com/docs`](https://api.everybite.com/docs)). The initial development phase will focus on providing comprehensive management capabilities for SmartMenus, which are applications embedded on restaurant partner websites or hosted on `app.everybite.com`.
*   1.2. Problem Statement
    *   Currently, managing and updating EveryBite's SmartMenus (over 60 in production, growing to ) requires direct intervention from the engineering team. This reliance on engineers for configuration changes consumes valuable development resources and introduces delays, particularly due to time zone differences with the engineering team based in Serbia. This manual process is not scalable to the projected growth of thousands of SmartMenus. There is a critical need to empower non-technical teams, starting with Customer Success and eventually restaurant customers themselves, to manage SmartMenu configurations directly. This requires a user-friendly, intuitive, and straightforward administration panel to ensure efficient, timely, and error-free management as EveryBite scales its SmartMenu offerings.
*   1.3. Goals & Objectives
    *   **Goal 1: Empower Non-Technical Users with an Intuitive Platform.**
        *   *Objective 1.1:* Design and develop an admin panel UI/UX that is exceptionally easy to understand and use for individuals with minimal technical expertise, particularly restaurant staff and Customer Success teams.
        *   *Objective 1.2:* Enable Customer Success teams to independently manage 100% of SmartMenu configurations for all enterprise (50-1000 locations) and SMB (initially 5-20 locations, then 5+) clients without engineering intervention.
    *   **Goal 2: Deliver a Fully Responsive and Accessible Management Experience.**
        *   *Objective 2.1:* Ensure all core SmartMenu management functionalities are seamlessly accessible and usable on both desktop and common mobile devices (smartphones, tablets).
        *   *Objective 2.2:* Adhere to WCAG 2.1 Level AA accessibility standards to ensure the platform is usable by people with a wide range of abilities.
    *   **Goal 3: Build a Scalable Self-Service Model for Future Growth.**
        *   *Objective 3.1:* Lay the foundation for a self-service portal enabling restaurant customers (starting with those managing 5+ locations) to directly configure and manage their SmartMenus.
        *   *Objective 3.2:* Design the system to efficiently handle the administration of thousands of unique SmartMenu instances as EveryBite scales.
    *   **Goal 4: Significantly Reduce Operational Overhead and Engineering Dependency.**
        *   *Objective 4.1:* Decrease engineering team involvement in day-to-day SmartMenu configuration tasks by at least 90% post-launch for Customer Success users.
        *   *Objective 4.2:* Streamline the SmartMenu setup and modification process, reducing the average time required for common changes by at least 75%.
*   1.4. Target Users & Phased Rollout

    The EveryBite Admin panel will be rolled out to different user groups in a phased approach.

    *   **Phase 1.1: Customer Success Enablement (Initial Development Focus)**
        *   **Users:** EveryBite Customer Success Teams.
        *   **Role & Responsibilities:** Serve as the primary administrators and expert configurators of SmartMenus on behalf of EveryBite's restaurant clients. They are responsible for the initial setup, ongoing updates, and troubleshooting of all SmartMenu features. This includes managing a wide array of settings related to SmartMenu branding, ordering capabilities, display preferences, and feature enablement. They work closely with restaurant clients to tailor SmartMenus.
        *   **Technical Comfort:** Generally non-technical; requiring an intuitive, user-friendly interface.
        *   **Key Tasks in Admin Panel:**
            *   Reading (viewing) current SmartMenu configurations.
            *   Updating all configurable SmartMenu attributes.
            *   Guiding restaurant clients through options.
            *   (Potentially future API dependent: Creating new SmartMenu instances, archiving/deactivating).

    *   **Phase 1.2: Sales Team Enablement (Subsequent Internal Phase)**
        *   **Users:** EveryBite Sales Teams.
        *   **Role & Responsibilities:** Responsible for configuring the commercial terms for performance-based products (e.g., SmartSell, SmartOrder) associated with a client's account. This includes setting Cost-Per-Click (CPC) and Cost-Per-Acquisition (CPA) rates.
        *   **Technical Comfort:** Generally non-technical.
        *   **Key Tasks in Admin Panel:**
            *   Accessing client accounts to manage commercial terms.
            *   Inputting and updating CPC and CPA rates for specific performance-based products.
            *   (Potentially) Viewing reports related to these commercial agreements or product activation status.

    *   **Phase 2: Limited Customer Access (Future Phase)**
        *   **Users:** Technically savvy restaurant customers (selected beta users).
        *   **Anticipated Role:** Early adopters providing feedback on self-service functionalities.

    *   **Phase 3: Broad-Based Customer Access (Future Phase)**
        *   **Users:** A wider group of restaurant customers.
        *   **Anticipated Role:** Expanded self-service capabilities.

    *   **Phase 4: General Availability (GA) for Customers (Future Phase)**
        *   **Users:** All eligible restaurant customers.
        *   **Anticipated Role:** Full-featured self-service SmartMenu management.

    *   **Phase 5: Evolving Self-Service (Future Phase)**
        *   **Users:** Restaurant customers.
        *   **Anticipated Role:** Advanced self-service features, product upsells, payment integration, etc.

    *(Note: This PRD will primarily detail the requirements for Phase 1.1 users. Subsequent phases/sub-phases will require PRD updates or addendums.)*
*   1.5. Scope (Phase 1.1: Customer Success Enablement) - DRAFT

    **In Scope:**

    *   **User Authentication:** Secure login for EveryBite Customer Success team members.
    *   **Client/SmartMenu Selection:** Ability for CS users to easily find, select, and view the current configuration of any existing SmartMenu widget.
    *   **Comprehensive SmartMenu Configuration Management:**
        *   A user-friendly interface to read and update **all attributes** detailed in `docs/_archive/SM ELEMENTS.MD` (via the GraphQL API), **with the explicit exclusion of "SmartSell banners" management for Phase 1.1.**
        *   This includes: Basics, Ordering, all Branding sections, Display settings, Features (Menu, Extensions, Search & Filter).
    *   **Responsive Design:** Optimized for use on desktop and tablet devices by Customer Success teams. *(Pending clarification: Is mobile also critical for CS in Phase 1.1?)*
    *   **Audit Logging:** Basic logging of changes (who changed what SmartMenu attribute, and when).

    **Out of Scope (for Phase 1.1):**

    *   **SmartSell Banner Management:** Configuration and management of "SmartSell banners".
    *   **Sales Team Functionalities:** (Designated for Phase 1.2).
    *   **Restaurant Customer Access:** (Phase 2+).
    *   **Self-Service Purchasing/Onboarding/Payment Integration:** (Phase 5+).
    *   **SmartAnalytics:** (Future product).
    *   **Third-Party Integrations:** (Future).
    *   **Direct Creation/Deletion of SmartMenus/Clients within Admin Panel:** *(Pending clarification: API capability and CS criticality for Phase 1.1).*
    *   **User Role Management within Admin Panel:** (Single "CS User" role assumed).
    *   **Marketing/Culinary Team Direct Access/Tools:** (No specific UI for these teams in Phase 1.1).

## 2. Product Features

*   **(Note:** For the initial local development version, User Authentication will be deferred. The focus will be on building out core functionalities locally. Authentication will be integrated before broader deployment or use by the Customer Success team.)*

*   2.1. **User Authentication** (Deferred for initial local build)
    *   2.1.1. Description: (To be detailed - Secure login for EveryBite Customer Success team members.)
    *   2.1.2. User Stories: (To be detailed)
    *   2.1.3. Functional Requirements: (To be detailed)
    *   2.1.4. Acceptance Criteria: (To be detailed)
    *   2.1.5. Priority: High (Post-initial local build)

*   2.2. **Dashboard**
    *   2.2.1. Description: The Dashboard will serve as the landing page for Customer Success (CS) team members, providing an at-a-glance overview of the SmartMenu network status. It will display key metrics and summaries to help CS users quickly understand the overall health, configuration status, and recent activity of SmartMenus.
    *   2.2.2. User Stories:
        *   **US1:** As a CS team member, I want to see the total number of SmartMenus in the system on the dashboard so that I understand the overall size of our network.
        *   **US2:** As a CS team member, I want to see the total number of *active* SmartMenus on the dashboard so that I know how many are currently live and in production.
        *   **US3:** As a CS team member, I want to see a summary on the dashboard of active SmartMenus that have specific key configurations:
            *   Count of active SmartMenus with images, ordering, AND card layout.
            *   Count of active SmartMenus with images.
            *   Count of active SmartMenus with ordering enabled.
            *   Count of active SmartMenus using the card layout.
            ...so that I can quickly assess the adoption of these important features.
        *   **US4:** As a CS team member, I want to see a list on the dashboard of SmartMenus that have gone into production in the last 30 days (including their names) so that I can easily track recent deployments and new activations.
    *   2.2.3. Functional Requirements:
        *   **FR1: Data Display - Key Metrics:** The dashboard MUST display the following numerical metrics:
            *   Total count of all SmartMenus.
            *   Total count of *active* SmartMenus (defined as having a production date).
            *   Count of active SmartMenus that have images, ordering, AND card layout configured.
            *   Count of active SmartMenus that have images configured.
            *   Count of active SmartMenus that have ordering enabled.
            *   Count of active SmartMenus that are using the card layout.
        *   **FR2: Data Display - Recent Activations:** The dashboard MUST display a list of SmartMenu names that have gone into production within the last 30 days.
            *   This list should be clearly labeled.
            *   If the list is long, it should be presented in a way that doesn't clutter the dashboard (e.g., scrollable, or showing the top N with a link to see all).
        *   **FR3: Data Calculation & Source:**
            *   All displayed metrics MUST be calculated based on the current data available from the backend/API.
            *   The "active" status of a SmartMenu is determined by the presence of a production date associated with it.
        *   **FR4: Presentation & Clarity:**
            *   All metrics and data points on the dashboard MUST be clearly labeled and presented in an easily understandable format.
            *   The visual design should allow for quick assimilation of the information.
        *   **FR5: Backend Connection Status Indicator:** The dashboard (or a persistent UI element visible from the dashboard) MUST display an indicator of the connection status to the backend API.
            *   This indicator should clearly show whether the connection is active, attempting to connect, or has failed.
            *   Visual cues (e.g., color changes, icons) should be used for quick recognition.
    *   2.2.4. Acceptance Criteria:
        *   **AC1: Key Metrics Visibility & Accuracy:**
            *   **Given** the CS user is on the Dashboard page,
            *   **When** the page loads and data is successfully fetched,
            *   **Then** all specified key metrics (Total SmartMenus, Active SmartMenus, counts for specific configurations like images/ordering/layout) MUST be displayed.
            *   **And** the displayed numbers MUST accurately reflect the current state of the SmartMenu data in the system.
        *   **AC2: Recent Activations List Display & Accuracy:**
            *   **Given** the CS user is on the Dashboard page,
            *   **When** the page loads and data is successfully fetched,
            *   **Then** a list of SmartMenu names that went into production in the last 30 days MUST be displayed.
            *   **And** the list MUST be accurate based on production dates.
            *   **And** if no SmartMenus were activated in the last 30 days, an appropriate message or "0" count should be displayed.
        *   **AC3: Backend Connection Status - Connected:**
            *   **Given** the admin panel has a successful connection to the backend API,
            *   **When** the CS user views the Dashboard,
            *   **Then** a visual indicator MUST clearly show that the connection is "active" or "connected."
        *   **AC4: Backend Connection Status - Disconnected/Error:**
            *   **Given** the admin panel cannot establish a connection to the backend API (or the connection is lost),
            *   **When** the CS user views the Dashboard,
            *   **Then** a visual indicator MUST clearly show that the connection is "inactive," "disconnected," or in an "error" state.
            *   **(Optional addition): And** the dashboard metrics MAY show stale data or an error message indicating data cannot be fetched.
        *   **AC5: Dashboard as Landing Page:**
            *   **Given** a CS user successfully accesses the admin panel (post-login, once authentication is implemented; for local build, on app start),
            *   **When** no specific view is requested,
            *   **Then** the Dashboard view MUST be the default page displayed.
    *   2.2.5. Priority: High (Initial Local Build)

*   2.3. **Client/SmartMenu Selection (List View)**
    *   2.3.1. Description: The admin panel must enable Customer Success (CS) users to efficiently locate and select specific client accounts and their associated SmartMenu instances. This will be facilitated by a comprehensive table view listing all SmartMenus, allowing users to search, filter, and sort. Upon selecting a SmartMenu from the table, the system should allow navigation to its detailed configuration page.
    *   2.3.2. User Stories:
        *   **US1:** As a Customer Success (CS) team member, I want to view a paginated table listing all SmartMenus so that I can get an overview of all instances and easily navigate through them.
        *   **US2:** As a CS team member, I want to be able to search for a SmartMenu by its Name or ID within the table view so that I can quickly find a specific instance I need to work on.
        *   **US3:** As a CS team member, I want to be able to sort the SmartMenu table by columns such as Name, ID, and Active Status so that I can organize the view according to my needs.
        *   **US4:** As a CS team member, I want to see key summary information for each SmartMenu directly in the table view—specifically Name, ID, Active Status (derived from whether it has a production date), State of Images, State of Ordering, Layout (card/table), and primary Colors—so that I can quickly assess key characteristics without navigating to the detail page.
        *   **US5:** As a CS team member, I want to be able to click on a specific SmartMenu row in the table so that I am taken to its detailed configuration page (the "SmartMenu Detail" view).
        *   **US6:** As a CS team member, I want to be able to filter the SmartMenu list by Active Status (e.g., show only active, show only inactive) so I can focus on relevant instances.
    *   2.3.3. Functional Requirements:
        *   **FR1: SmartMenu Table Display:**
            *   The system MUST display a table listing SmartMenus.
            *   The table MUST include the following columns/indicators for each SmartMenu:
                *   Name
                *   ID
                *   Active Status (derived from the presence of a production date)
                *   State of Images (e.g., "Configured", "Not Configured", or a visual indicator)
                *   State of Ordering (e.g., "Enabled", "Disabled")
                *   Layout (e.g., "Card", "Table")
                *   Primary Colors (could be a visual swatch or hex codes)
                *   **UTM on OrderURL Indicator:** A visual indicator (e.g., an icon) showing whether the `OrderURL` contains the `utm_source=everybite` parameter.
        *   **FR2: Pagination:**
            *   The SmartMenu table MUST be paginated if the number of SmartMenus exceeds a predefined limit per page (e.g., 20, 50).
            *   Users MUST be able to navigate to the next, previous, first, and last pages.
        *   **FR3: Search Functionality:**
            *   The system MUST provide a search input field.
            *   Users MUST be able to search for SmartMenus by `Name` and `ID`.
            *   The table display MUST update dynamically to show only matching SmartMenus as the user types or submits the search.
        *   **FR4: Sorting Functionality:**
            *   Users MUST be able to sort the SmartMenu table by at least the following columns:
                *   Name (alphabetically, A-Z, Z-A)
                *   ID (alphanumerically/numerically)
                *   Active Status (e.g., active first, inactive first)
            *   The current sort order and direction MUST be visually indicated.
        *   **FR5: Filtering Functionality:**
            *   Users MUST be able to filter the SmartMenu list by `Active Status` (e.g., All, Active Only, Inactive Only).
        *   **FR6: Navigation to Detail View:**
            *   Each row in the SmartMenu table MUST be clickable.
            *   Clicking on a SmartMenu row MUST navigate the user to the "Comprehensive SmartMenu Configuration Management (Detail View)" for that specific SmartMenu.
        *   **FR7: Data Source & Accuracy:**
            *   All data displayed in the table (names, IDs, statuses, configurations, **UTM presence in OrderURL**) MUST be fetched from the backend API and accurately reflect the current state of the SmartMenus.
            *   The check for `utm_source=everybite` in the `OrderURL` must be performed accurately.
    *   2.3.4. Acceptance Criteria:
        *   **AC1: Table Content and Accuracy:**
            *   **Given** the CS user navigates to the "Client/SmartMenu Selection (List View)",
            *   **When** the page loads and data is successfully fetched,
            *   **Then** a table of SmartMenus MUST be displayed.
            *   **And** each row MUST display: Name, ID, Active Status, State of Images indicator, State of Ordering indicator, Layout, Primary Colors, and the UTM on OrderURL indicator.
            *   **And** all displayed data MUST be accurate according to the backend data.
            *   **And** the UTM on OrderURL indicator MUST correctly show if `utm_source=everybite` is present in the SmartMenu's `OrderURL`.
        *   **AC2: Pagination Functionality:**
            *   **Given** there are more SmartMenus than the page limit (e.g., >50),
            *   **When** the user is on the List View,
            *   **Then** pagination controls (e.g., next, previous, page numbers) MUST be visible and enabled.
            *   **And** clicking "next" MUST load the next set of SmartMenus.
            *   **And** clicking "previous" MUST load the previous set.
        *   **AC3: Search Functionality:**
            *   **Given** the user is on the List View,
            *   **When** the user types a known SmartMenu Name (or part of it) into the search field and submits/triggers search,
            *   **Then** the table MUST update to show only SmartMenus matching that Name.
            *   **When** the user types a known SmartMenu ID into the search field and submits/triggers search,
            *   **Then** the table MUST update to show only the SmartMenu matching that ID.
        *   **AC4: Sorting Functionality:**
            *   **Given** the user is on the List View,
            *   **When** the user clicks the sort icon/header for the "Name" column,
            *   **Then** the table MUST be sorted by Name (ascending, then descending on a second click).
            *   **And** this behavior MUST apply similarly for "ID" and "Active Status" columns.
            *   **And** a visual indicator MUST show the current sort column and direction.
        *   **AC5: Filtering by Active Status:**
            *   **Given** the user is on the List View,
            *   **When** the user selects the "Active" filter for Active Status,
            *   **Then** the table MUST display only SmartMenus that are active.
            *   **When** the user selects the "Inactive" filter,
            *   **Then** the table MUST display only SmartMenus that are inactive.
            *   **When** the user selects the "All" filter,
            *   **Then** the table MUST display all SmartMenus, regardless of active status.
        *   **AC6: Navigation to Detail View:**
            *   **Given** the user is on the List View with SmartMenus displayed,
            *   **When** the user clicks on a specific SmartMenu row,
            *   **Then** the application MUST navigate to the "Comprehensive SmartMenu Configuration Management (Detail View)" for the selected SmartMenu.
            *   **And** the correct SmartMenu's data MUST be loaded in the Detail View.
    *   2.3.5. Priority: High (Initial Local Build)

*   2.4. **Comprehensive SmartMenu Configuration Management (Detail View)**
    *   2.4.1. Description: The SmartMenu Detail View provides a comprehensive interface for Customer Success (CS) team members to view and modify all configurable attributes of a selected SmartMenu instance. This view will allow CS users to manage settings related to a SmartMenu's basics, ordering capabilities, branding (including colors, fonts, logos), display settings, and various features (such as menu presentation, extensions, search, and filtering), as defined in the `docs/_archive/SM ELEMENTS.MD` document (excluding SmartSell banners for Phase 1.1). The interface must be user-friendly, clearly presenting current configurations and allowing for intuitive updates that are then persisted via the GraphQL API.
    *   2.4.2. User Stories:
        *   **US1 (Refined):** As a Customer Success (CS) team member, I want to view all current configuration settings for a selected SmartMenu, clearly organized into logical and intuitive sections (e.g., Basics, Branding, Ordering, Features) based on their purpose, so that I can quickly understand its current state and easily locate specific settings I need to modify.
        *   **US2:** As a CS team member, I want to modify any configurable SmartMenu attribute (e.g., text fields, colors, toggles for features, layout options) using simple, intuitive controls (like text inputs, color pickers, dropdowns, toggles) that provide clear context about what each setting does, so that I can make changes accurately and efficiently.
        *   **US3:** As a CS team member, I want to have access to brief, clear explanations or tooltips for settings that might not be immediately obvious, so that I can understand their purpose and impact before making changes.
        *   **US4:** As a CS team member, I want a clear and prominent way to save any changes I've made to a SmartMenu's configuration, so that the updates are reliably persisted to the backend.
        *   **US5:** As a CS team member, I want to receive immediate and clear visual confirmation (e.g., a success message) after my changes have been successfully saved, so I am confident the updates have been applied.
        *   **US6:** As a CS team member, I want to be warned if I try to navigate away from the Detail View with unsaved changes, so that I don't accidentally lose my work.
        *   **US7:** As a CS team member, I want the input controls and presentation of settings to be consistent with the mock-ups provided (once available), so that the interface is predictable and easy to learn.
        *   **US8 (New):** As a Customer Success (CS) team member, I want to use a clear sub-navigation menu within the SmartMenu Detail View to quickly jump to specific categories of settings (e.g., Basics, Branding, Ordering), so I don't have to scroll through all settings to find what I need, especially when dealing with a large number of configurations.
    *   2.4.3. Functional Requirements:
        *   **FR1: Display of SmartMenu Data:**
            *   Upon navigation to the Detail View for a specific SmartMenu, the system MUST fetch and display all current configuration data for that SmartMenu from the backend API.
            *   The displayed SmartMenu Name and/or ID MUST be clearly visible as a header or title for the view.
        *   **FR2: Grouping and Sub-Navigation (Based on `SM ELEMENTS.MD`):**
            *   Configurable attributes (as defined in `docs/_archive/SM ELEMENTS.MD`, excluding SmartSell banners for Phase 1.1) MUST be organized into logical groups **as defined by the structure within the `docs/_archive/SM ELEMENTS.MD` document.**
            *   A sub-navigation mechanism (e.g., sidebar menu, tabs) MUST be provided, allowing users to select a configuration group corresponding to these defined sections.
            *   Selecting a group from the sub-navigation MUST display only the settings relevant to that group in the main content area.
            *   The currently active sub-navigation group MUST be clearly indicated.
        *   **FR3: Configuration Controls:**
            *   For each configurable attribute, an appropriate and intuitive UI control MUST be provided (e.g., text input for names, color picker for colors, toggle switches for boolean settings, dropdowns for predefined options, file upload for images/logos).
            *   Controls MUST clearly display the current value of the attribute.
            *   Input validation appropriate for each field type MUST be implemented (e.g., character limits, URL format, number ranges). Error messages for invalid input MUST be clear and helpful.
            *   Where applicable, controls should adhere to the design and behavior specified in the forthcoming mock-ups.
        *   **FR4: Contextual Information:**
            *   Brief, clear descriptions or tooltips SHOULD be available for settings whose purpose or impact might not be immediately obvious to a CS user.
        *   **FR5: Saving Changes:**
            *   A clear and easily accessible "Save" or "Apply Changes" button MUST be provided.
            *   Clicking "Save" MUST send all modified configuration data to the backend API to update the SmartMenu.
        *   **FR6: Confirmation of Save:**
            *   Upon successful save, a clear visual confirmation (e.g., success message, toast notification) MUST be displayed to the user.
            *   If saving fails, a clear error message MUST be displayed, ideally indicating the reason for failure if known.
        *   **FR7: Unsaved Changes Warning:**
            *   If the user has made changes to any configuration settings and attempts to navigate away from the Detail View (e.g., by clicking a main navigation link, closing the tab/browser, or navigating back) without saving, the system MUST present a warning dialog.
            *   The dialog MUST give the user the option to "Save Changes," "Discard Changes," or "Cancel" (stay on the page).
        *   **FR8: Data Integrity & API Interaction:**
            *   All configuration changes MUST be persisted by making appropriate calls to the GraphQL API.
            *   The system MUST correctly map UI controls to the corresponding GraphQL fields.
    *   2.4.4. Acceptance Criteria:
        *   **AC1: Data Display and Initial State:**
            *   **Given** the CS user navigates to the Detail View for a specific SmartMenu,
            *   **When** the view loads,
            *   **Then** all current configuration data for that SmartMenu MUST be fetched from the backend API and accurately displayed.
            *   **And** the SmartMenu Name and/or ID MUST be clearly displayed as a header/title.
        *   **AC2: Grouping and Sub-Navigation Functionality:**
            *   **Given** the CS user is on the Detail View for a SmartMenu,
            *   **Then** configuration settings MUST be grouped according to the structure defined in `docs/_archive/SM ELEMENTS.MD`.
            *   **And** a sub-navigation menu (e.g., sidebar or tabs) MUST be present, listing these configuration groups.
            *   **When** the user clicks a group in the sub-navigation,
            *   **Then** only the settings for that group MUST be displayed in the main content area.
            *   **And** the currently selected sub-navigation group MUST be visually highlighted.
        *   **AC3: Configuration Control Behavior and Validation:**
            *   **Given** the CS user is on the Detail View for a SmartMenu,
            *   **When** interacting with any configuration control (e.g., text input, color picker, toggle, dropdown) for an attribute,
            *   **Then** the control MUST accurately display the current value of the attribute.
            *   **And** the control MUST allow the user to modify the value as expected.
            *   **And** input validation (e.g., for URLs, numbers, text length) MUST work correctly, showing clear error messages for invalid input.
            *   **And** tooltips or brief descriptions SHOULD be available for non-obvious settings.
        *   **AC4: Saving Changes and Confirmation:**
            *   **Given** the CS user has modified configuration settings on the Detail View,
            *   **When** the user clicks the "Save" or "Apply Changes" button,
            *   **Then** all modified data MUST be sent to the backend API.
            *   **And** upon successful save, a clear success confirmation message MUST be displayed.
            *   **And** if the save operation fails, an appropriate error message MUST be displayed.
        *   **AC5: Unsaved Changes Warning:**
            *   **Given** the CS user has made unsaved changes in the Detail View,
            *   **When** the user attempts to navigate away (e.g., clicks a main navigation link, closes tab, navigates back),
            *   **Then** a warning dialog MUST appear.
            *   **And** the dialog MUST offer options to "Save Changes," "Discard Changes," and "Cancel."
            *   **And** each option MUST behave as expected.
        *   **AC6: API Integration for Persistence:**
            *   **Given** changes are saved through the UI in the Detail View,
            *   **When** inspecting the backend data,
            *   **Then** the configuration changes MUST be correctly persisted in the database via GraphQL API calls.
            *   **And** data fetched from the API MUST be correctly mapped to UI controls and vice-versa.
        *   **AC7: Adherence to Mock-ups and UI Library:**
            *   **Given** the CS user is viewing the Detail View,
            *   **When** inspecting the layout, appearance, and behavior,
            *   **Then** it MUST align with the provided mock-ups (once available).
            *   **And** it MUST be implemented primarily using components from the selected standard React UI library (e.g., ShadCN/ui), minimizing custom UI component development.
    *   2.4.5. Priority: High (Initial Local Build)

*   2.5. **Audit Logging**
    *   2.5.1. Description: The Audit Logging feature will systematically record significant actions performed within the EveryBite Admin application, primarily focusing on changes made to SmartMenu configurations. For Phase 1.1 (local build), these logs will track modifications to SmartMenu attributes, noting the attribute changed, its old value, and its new value, along with a timestamp. This will provide a historical record of changes, aiding in troubleshooting, understanding configuration evolution, and preparing for future enhancements where user attribution for changes will be critical. The initial implementation may not have a dedicated UI for viewing these logs within the app, but the logging mechanism itself needs to be established to capture this data.
    *   2.5.2. User Stories:
        *   **US1: Recording SmartMenu Configuration Changes:** As the system, I need to automatically record an audit log entry whenever a SmartMenu configuration attribute is successfully changed via the SmartMenu Detail View, so that a history of modifications is maintained.
        *   **US2: Logged Information for Changes:** As the system, I need each audit log entry for a configuration change to include the specific SmartMenu ID, the attribute that was changed, the value before the change (old value), the value after the change (new value), and a precise timestamp of when the change occurred, so that the nature and timing of modifications are clear.
        *   **US3: Accessing Audit Logs (Developer/Admin - Future):** As a developer or future system administrator, I want to be able to access and review the audit logs (e.g., via database query, log files, or a future admin interface), so that I can troubleshoot issues, trace the history of a SmartMenu's configuration, or investigate unexpected changes.
        *   **US4: Log Integrity and Persistence:** As the system, I need to ensure that audit logs are reliably persisted (e.g., in the database or a dedicated logging system) and are protected from accidental or unauthorized modification, so that the historical record is accurate and trustworthy.
    *   2.5.3. Functional Requirements:
        *   **FR1: Automatic Log Creation:**
            *   The system MUST automatically create an audit log entry when any configurable attribute of a SmartMenu is successfully modified and saved via the SmartMenu Detail View.
        *   **FR2: Log Content:**
            *   Each audit log entry MUST contain at least the following information:
                *   `smartMenuId`: The unique identifier of the SmartMenu that was modified.
                *   `attributeName`: The name of the specific configuration attribute that was changed (e.g., "primaryColor", "orderUrl", "isActive").
                *   `oldValue`: The value of the attribute before the change. For new attributes or complex objects, this might be null or a simplified representation.
                *   `newValue`: The value of the attribute after the change.
                *   `timestamp`: A precise, system-generated timestamp (e.g., UTC) indicating when the change was persisted.
                *   (Future consideration, not for Phase 1.1: `userId`: Identifier of the user who made the change, once authentication is implemented).
        *   **FR3: Log Storage and Persistence:**
            *   Audit logs MUST be stored reliably and persistently. For Phase 1.1, this will likely be a dedicated collection/table in the MongoDB database.
            *   The storage mechanism MUST ensure data integrity for the logs.
        *   **FR4: Scope of Logging (Phase 1.1):**
            *   For Phase 1.1, audit logging will focus exclusively on changes to SmartMenu configuration attributes made through the Admin UI. Other system events or user actions (like login attempts, if they existed) are out of scope for this phase's audit logging.
        *   **FR5: No UI for Log Viewing (Phase 1.1):**
            *   For Phase 1.1, there is NO requirement to build a user interface within the EveryBite Admin application for viewing or querying these audit logs. Access will be via direct database query or other backend means by developers/administrators.
        *   **FR6: Performance Considerations:**
            *   The audit logging mechanism SHOULD be designed to minimize any perceivable performance impact on the SmartMenu configuration saving process. Logging should occur asynchronously if possible, or be very lightweight if synchronous.
    *   2.5.4. Acceptance Criteria:
        *   **AC1: Log Creation on SmartMenu Change:**
            *   **Given** a CS user is on the SmartMenu Detail View,
            *   **When** the user successfully modifies and saves one or more configuration attributes of a SmartMenu,
            *   **Then** for each modified attribute, a corresponding audit log entry MUST be created and persisted in the designated log storage (e.g., MongoDB collection).
        *   **AC2: Accuracy of Logged Information:**
            *   **Given** an audit log entry is created for a SmartMenu configuration change,
            *   **When** inspecting the log entry,
            *   **Then** the `smartMenuId` MUST correctly identify the modified SmartMenu.
            *   **And** the `attributeName` MUST accurately reflect the specific attribute that was changed.
            *   **And** the `oldValue` MUST correctly represent the attribute's value before the modification.
            *   **And** the `newValue` MUST correctly represent the attribute's value after the modification.
            *   **And** the `timestamp` MUST be an accurate, system-generated timestamp of when the change was persisted.
        *   **AC3: No Logs for Unchanged or Failed Saves:**
            *   **Given** a CS user is on the SmartMenu Detail View,
            *   **When** the user attempts to save but no attributes were actually changed, OR the save operation fails due to validation errors or system issues,
            *   **Then** NO audit log entry for configuration changes MUST be created.
        *   **AC4: Log Persistence and Integrity (Backend Verification):**
            *   **Given** multiple SmartMenu configuration changes have been successfully saved, resulting in audit log entries,
            *   **When** querying the audit log storage directly (e.g., MongoDB collection),
            *   **Then** all created log entries MUST be present and accurately reflect the changes made.
            *   **And** the logs MUST be in a consistent and queryable format.
        *   **AC5: Performance Impact:**
            *   **Given** the audit logging mechanism is active,
            *   **When** a CS user saves changes to a SmartMenu configuration,
            *   **Then** there SHOULD be no perceivable degradation in the performance or responsiveness of the save operation compared to if logging were disabled.
    *   2.5.5. Priority: Medium (Core mechanism for Phase 1.1, full utility with User Auth)

## 3. User Experience (UX) & Design Requirements

### 3.1. General Design Principles

1.  **User-Centric Design**
    *   Prioritize the needs and workflows of Customer Success team members, who are the primary users for Phase 1.1.
    *   Design for users with varying levels of technical expertise, ensuring the interface is intuitive and requires minimal training.

2.  **Clarity & Simplicity**
    *   Present information and actions in a clear, concise, and unambiguous manner.
    *   Use plain language and avoid technical jargon where possible. If technical terms are necessary, provide contextual help or tooltips.
    *   Strive for a clean, uncluttered interface that focuses the user on the task at hand.

3.  **Consistency**
    *   Maintain consistent UI patterns, terminology, iconography, and interaction models throughout the application.
    *   Adhere to the design language established by the chosen UI component library (e.g., ShadCN/ui) and EveryBite's branding guidelines.

4.  **Efficiency & Productivity**
    *   Design workflows to minimize the number of steps required for common tasks.
    *   Provide clear navigation and information architecture to help users find what they need quickly.
    *   Consider features like sensible defaults, bulk actions (where appropriate in future phases), and keyboard accessibility to enhance productivity.

5.  **Feedback & Guidance**
    *   Provide immediate and clear feedback for user actions (e.g., successful save, errors, loading states).
    *   Use visual cues (e.g., loading spinners, success/error messages, progress indicators) to keep the user informed of the system status.
    *   Include helpful error messages that explain the problem and suggest solutions.
    *   Implement inline validation for input fields to catch errors early.

6.  **Accessibility (WCAG 2.1 Level AA)**
    *   Ensure the application is usable by people with a wide range of abilities, adhering to WCAG 2.1 Level AA guidelines.
    *   This includes considerations for keyboard navigation, screen reader compatibility, sufficient color contrast, and clear focus indicators.

7.  **Responsive Design (Desktop & Tablet First for Phase 1.1)**
    *   Ensure a seamless and effective user experience on primary target devices: desktop and tablet computers for Customer Success teams.
    *   Layouts should adapt gracefully to different screen sizes and orientations within this scope.

8.  **Visual Hierarchy & Information Architecture**
    *   Use visual cues (e.g., typography, spacing, color) to establish a clear hierarchy of information and actions.
    *   Group related items and actions logically to improve scannability and comprehension.

9.  **Error Prevention & Forgiveness**
    *   Design the interface to prevent common errors (e.g., by disabling irrelevant options, providing clear instructions).
    *   Offer confirmation dialogs for destructive actions (e.g., before discarding unsaved changes).
    *   Provide clear ways for users to undo actions or recover from mistakes where feasible.

10. **Performance & Responsiveness**
    *   Optimize for quick load times and a responsive interface.
    *   Provide loading indicators for operations that may take time to complete, so the user understands the system is working.
### 3.2. Key User Flows

This section outlines the primary user journeys for Customer Success (CS) team members interacting with the EveryBite Admin panel in Phase 1.1.

**User Flow 1: Assessing SmartMenu Network Status & Recent Activity**

1.  **Actor:** CS Team Member
2.  **Goal:** Get an overview of the SmartMenu network and identify recently activated SmartMenus.
3.  **Steps:**
    *   a. User accesses the EveryBite Admin panel.
    *   b. User lands on the **Dashboard**.
    *   c. User views key metrics:
        *   Total SmartMenus.
        *   Total Active SmartMenus.
        *   Counts of SmartMenus with specific configurations (images, ordering, layout).
    *   d. User reviews the list of "Recently Activated SmartMenus" (last 30 days).
    *   e. User notes the backend connection status.
4.  **Outcome:** CS team member has a current understanding of the SmartMenu landscape and recent deployments.

**User Flow 2: Finding and Viewing a Specific SmartMenu's Configuration**

1.  **Actor:** CS Team Member
2.  **Goal:** Locate a particular SmartMenu and review its current settings.
3.  **Pre-condition:** User knows the Name or ID of the SmartMenu, or needs to browse for it.
4.  **Steps:**
    *   a. User navigates to the **Client/SmartMenu Selection (List View)** from the main navigation.
    *   b. To find a specific SmartMenu:
        *   User utilizes the search bar, entering the SmartMenu Name or ID, and observes the list filtering dynamically or upon submission.
    *   c. To browse or explore:
        *   User views the paginated list of SmartMenus.
        *   User sorts the list by columns like Name, ID, or Active Status.
        *   User filters the list by Active Status (Active, Inactive, All).
    *   d. User identifies the target SmartMenu in the list and clicks on its row (or a dedicated "View/Edit" action item).
    *   e. User is navigated to the **Comprehensive SmartMenu Configuration Management (Detail View)** for the selected SmartMenu.
    *   f. User views the current configuration settings, which are clearly organized into sections (e.g., Basics, Branding, Ordering, Features) accessible via sub-navigation (e.g., sidebar or tabs).
5.  **Outcome:** CS team member can efficiently locate any SmartMenu and access its detailed configuration for review.

**User Flow 3: Modifying a SmartMenu's Configuration**

1.  **Actor:** CS Team Member
2.  **Goal:** Update one or more settings for a specific SmartMenu and persist these changes.
3.  **Pre-condition:** User is on the **Comprehensive SmartMenu Configuration Management (Detail View)** for the target SmartMenu (as per User Flow 2).
4.  **Steps:**
    *   a. User uses the sub-navigation (e.g., sidebar, tabs) to select the relevant configuration group (e.g., "Branding," "Ordering," "Features").
    *   b. User interacts with the UI controls (e.g., text inputs, color pickers, toggles, dropdowns) within the selected group to modify the desired attribute(s).
        *   Input validation provides immediate feedback for any incorrect data format.
        *   Tooltips or brief descriptions are available for less obvious settings.
    *   c. User repeats steps a-b for any other attributes across different sections they need to change.
    *   d. User clicks the prominent "Save" or "Apply Changes" button.
    *   e. System validates all modified inputs across all sections.
        *   If validation fails for any field, user sees clear error messages highlighting the problematic fields and remains on the Detail View to correct them (returns to step b or d).
    *   f. System attempts to save all accumulated valid changes to the backend via the GraphQL API.
        *   If the save operation is successful, the user sees a clear success confirmation message (e.g., toast notification). An audit log entry is created for each changed attribute.
        *   If the save operation fails due to a backend/API issue, the user sees an appropriate error message, and changes remain unsaved on the UI for potential retry.
5.  **Outcome:** The SmartMenu's configuration is accurately updated in the system, the changes are logged for audit purposes, and the user receives clear feedback on the outcome.

**User Flow 4: Attempting to Navigate Away with Unsaved Changes**

1.  **Actor:** CS Team Member
2.  **Goal:** Prevent accidental loss of unsaved work.
3.  **Pre-condition:** User is on the **Comprehensive SmartMenu Configuration Management (Detail View)** and has made changes to one or more attributes without clicking "Save."
4.  **Steps:**
    *   a. User attempts to navigate away from the Detail View (e.g., clicks a main navigation link, uses the browser's back button, attempts to close the tab/browser).
    *   b. System detects unsaved changes and presents a confirmation dialog (modal).
    *   c. The dialog clearly states that there are unsaved changes and offers options like: "Save Changes," "Discard Changes," and "Cancel" (or "Stay on Page").
    *   d. User selects an option:
        *   If "Save Changes": System attempts to save the changes (as per User Flow 3, steps e-f). If the save is successful, navigation proceeds. If the save fails, the dialog may close, and the user remains on the Detail View with changes still pending and error messages displayed.
        *   If "Discard Changes": Changes made in the UI are reverted to their last saved state, and navigation proceeds.
        *   If "Cancel" (or "Stay on Page"): The dialog closes, and the user remains on the Detail View with their unsaved changes intact.
5.  **Outcome:** User either successfully saves their work before navigating, intentionally discards it, or cancels the navigation, thus preventing accidental data loss.
*   3.3. Wireframes/Mockups
    *   *(Note: Mock-ups for the SmartMenu Detail View, emphasizing simple and intuitive controls for CS agents, will be provided by the user and linked/added here.)*
*   3.4. Accessibility Requirements
*   3.5. Branding Guidelines
*   3.6. UI Component Library
    *   To ensure consistency, accelerate development, and maintain high quality, the frontend will primarily utilize a standard React UI component library (e.g., ShadCN/ui). Custom UI components should only be created when a suitable component is not available in the chosen library and the need is well-justified.

## 4. Technical Requirements

*   4.1. Technology Stack
*   4.2. Performance Requirements
*   4.3. Scalability Requirements
*   4.4. Security Requirements
*   4.5. Data Management & Storage
*   4.6. Integration Points

## 5. Release Criteria & Success Metrics

*   5.1. Definition of Done
*   5.2. Key Performance Indicators (KPIs)

## 6. Future Considerations (Optional)

*   6.1. Potential Future Features
*   6.2. Long-term Vision
