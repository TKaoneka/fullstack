sequenceDiagram
    participant browser
    participant server

    Note over browser: User writes a note and clicks the Save button
    
    Note over browser: The browser executes the event handler, updates the local notes list, and re-renders the notes on the page

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa Payload: {"content": "Sopranos", "date": "2026-08-23"}
    activate server
    server-->>browser: HTTP 201 Created (JSON: {"message": "note created"})
    deactivate server