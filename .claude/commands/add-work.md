# Add or update work experience

Add a new job or update existing work experience on the website.

## Instructions

1. Ask the user for the following details (if not provided):
   - Company name
   - Role/title
   - Start date (YYYY-MM format)
   - End date (YYYY-MM format, or leave empty if current position)
   - Description of the role
   - Key highlights/achievements (list of bullet points)

2. Read the current `src/data/work.json` file

3. Add the new work entry to the JSON array with this structure:
   ```json
   {
     "company": "Company Name",
     "role": "Job Title",
     "startDate": "YYYY-MM",
     "endDate": "YYYY-MM",
     "description": "Brief description of the role and responsibilities",
     "highlights": [
       "Achievement or responsibility 1",
       "Achievement or responsibility 2"
     ]
   }
   ```

4. Write the updated JSON back to `src/data/work.json`

5. Confirm the addition was successful and show the user the new entry

## Notes

- Set `endDate` to `null` for current positions (will display as "Present")
- The website automatically sorts work by end date (current jobs first, then most recent)
- Keep descriptions concise but informative
- Highlights should be measurable achievements where possible
