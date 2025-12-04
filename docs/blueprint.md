# **App Name**: ProcurementFlow

## Core Features:

- User Authentication: Secure login with username/password, password hashing, and session management. Handles 'blacklisted' users and displays the consent screen.
- Dashboard: Display KPIs (procurement volume, receipts, allocations, balances, active applications) aggregated per branch, switchable per role and branch.
- CRUD for master data: Create, read, update and delete (CRUD) operations for branches, procurement processes, lots, applications, receipts, and allocations.
- Role-Based Access Control: Limit access to data and actions based on user roles (Participant, Manager, Analyst, Administrator) and branch affiliation.
- Data Filtering and Aggregation: Filter all data (lists, reports) by branch, and aggregate reports across multiple branches for Admins/Analysts.
- Report Builder: Construct custom reports by selecting entities, fields, filters, groupings, and sorting. Save report presets and export the current view to Excel/CSV with server-side generation.
- Document Agreement Capture: Presents user with User Agreement, Privacy Policy, and Joint Procurement Rules on first login; enforces consent with a checkbox. All text is in Russian.
- Branches/Objects: Functionality for managing branches/objects (e.g., residential complexes).
- User Management: User management without self-registration: login, password (hash), name, surname, phone, Telegram, roles, list of branches, 'blacklist' flag.
- Procurements and Lots: Functionality for managing procurements, lots (plan, price, deadlines, statuses), participant applications for lots, receipts for lots, allocations (issuance) for applications, report settings.
- User Creation and Password Handling: Upon creation, the system generates a password and shows the administrator a modal window with the login and password for copying; then the password is only stored as a hash. Ability to update the password by the administrator (modal window with login and password for copying).
- Login and Phone Uniqueness: Uniqueness of login and phone number (no duplicates allowed); an error occurs when attempting to create a duplicate.
- Blacklist Functionality: If a user is marked as blacklisted, they cannot log in, and their active sessions are invalidated.
- Authorization Page: The main page is only an authorization form (login + password), without access to internal data before login.
- Secure Sessions: Secure sessions (cookies/tokens), session timeout, basic protection against injections/XSS/CSRF and brute force attacks by login.
- Dashboard Display: Dashboard with a 'Branch' switch and KPIs for the selected branch (procurement volume, receipts, allocations, balances, active applications). The administrator can view aggregated indicators for all branches.
- Lists and Cards: Lists and cards: branches, purchases, lots (card-based UI), applications, receipts, allocations.

## Style Guidelines:

- Primary color: A calm and professional dark blue (#2c3e50) to convey trust and efficiency.
- Background color: Light gray (#f0f0f0) to provide a clean, uncluttered backdrop.
- Accent color: A vibrant orange (#e67e22) to highlight key actions and success states.
- Body and headline font: 'Open Sans', a humanist sans-serif font, will be used for its readability and clean aesthetic. Application text is in Russian.
- Use simple, clear icons representing each data type (e.g., branches, lots, users).
- Card-based UI for lots to provide a clear and organized layout, improving data presentation.
- Subtle transitions when loading data and navigating between sections to enhance user experience.