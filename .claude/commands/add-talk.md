# Add a new presentation/talk

Add a new presentation to the website. The user will provide details about the talk.

## Instructions

1. Ask the user for the following details (if not provided):
   - Title of the talk
   - Event/meetup name where it was presented
   - Date of the presentation (YYYY-MM-DD format)
   - Description (optional, brief summary)
   - Google Slides URL (optional)
   - Video URL (optional, e.g., YouTube)
   - PDF file path (optional, if uploading to repo put in `public/slides/`)

2. Extract the year from the date provided (e.g., "2024" from "2024-01-15")

3. Read the year's JSON file at `src/data/presentations/YYYY.json` (e.g., `src/data/presentations/2024.json`)
   - If the file doesn't exist, create it with an empty array

4. Add the new presentation entry to the JSON array with this structure:
   ```json
   {
     "title": "Talk Title",
     "event": "Event Name",
     "date": "YYYY-MM-DD",
     "description": "Brief description of the talk",
     "slides": "https://docs.google.com/presentation/d/...",
     "video": "https://youtube.com/watch?v=...",
     "slidePdf": "/slides/filename.pdf"
   }
   ```

5. Write the updated JSON back to `src/data/presentations/YYYY.json`

6. If a PDF was provided for upload, ensure it's placed in `public/slides/`

7. Confirm the addition was successful and show the user the new entry

## Notes

- Set `slides`, `video`, or `slidePdf` to `null` if not provided
- The website automatically sorts talks by date (newest first)
- PDF paths should start with `/slides/` if stored in this repo
- Presentations are organized by year (e.g., `2024.json`, `2025.json`)
