# Rent Room UML Diagrams

These PlantUML diagrams document the current application implementation:

- `use-case` — guest and administrator capabilities, including the external Google OAuth, email, and UploadThing integrations.
- `class` — TypeScript data interfaces, MongoDB collections, references, and the server-action modules that operate on them. The application uses interfaces and document collections, not a class-based domain model.
- `sequence` — the room availability lookup and booking creation flow, including the implemented authorization, conflict checks, persistence, and error paths.
- `activity` — the end-to-end availability search and booking decision flow.

The analytics feature estimates the value of confirmed bookings. It does not report profit because the application does not track actual payments or expenses.
