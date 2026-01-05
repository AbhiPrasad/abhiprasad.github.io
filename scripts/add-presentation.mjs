#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRESENTATIONS_DIR = join(__dirname, '..', 'src', 'data', 'presentations');

const options = {
  title: { type: 'string', short: 't' },
  event: { type: 'string', short: 'e' },
  date: { type: 'string', short: 'd' },
  description: { type: 'string' },
  slides: { type: 'string', short: 's' },
  video: { type: 'string', short: 'v' },
  pdf: { type: 'string', short: 'p' },
  interactive: { type: 'boolean', short: 'i' },
  help: { type: 'boolean', short: 'h' },
};

function showHelp() {
  console.log(`
Usage: npm run add-talk -- [options]

Modes:
  (no args)          Interactive mode - prompts for each field
  -i, --interactive  Interactive mode (explicit)

Required (in CLI mode):
  -t, --title        Talk title
  -e, --event        Event/meetup name
  -d, --date         Date (YYYY-MM-DD format)

Optional:
  --description      Brief description of the talk
  -s, --slides       Google Slides URL
  -v, --video        Video URL (e.g., YouTube)
  -p, --pdf          PDF filename (stored in /slides/)
  -h, --help         Show this help message

Examples:
  npm run add-talk                    # Interactive mode
  npm run add-talk -- -t "My Talk" -e "JSConf" -d "2024-06-15"
  npm run add-talk -- --title "Advanced TS" --event "Conference" --date "2024-06-15" --slides "https://..."
`);
}

function validateDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

async function promptInteractive() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\nAdd a new presentation (press Enter to skip optional fields)\n');

  const prompt = async (question, required = false, validator = null) => {
    while (true) {
      const answer = (await rl.question(question)).trim();
      if (!answer && required) {
        console.log('  This field is required.');
        continue;
      }
      if (answer && validator && !validator(answer)) {
        console.log('  Invalid format. Please try again.');
        continue;
      }
      return answer || null;
    }
  };

  const values = {};

  values.title = await prompt('Title (required): ', true);
  values.event = await prompt('Event/meetup name (required): ', true);
  values.date = await prompt('Date (YYYY-MM-DD, required): ', true, validateDate);
  values.description = await prompt('Description (optional): ');
  values.slides = await prompt('Google Slides URL (optional): ');
  values.video = await prompt('Video URL (optional): ');
  values.pdf = await prompt('PDF filename (optional, e.g., my-talk.pdf): ');

  rl.close();
  return values;
}

function savePresentation(values) {
  // Extract year from date
  const year = values.date.substring(0, 4);
  const filePath = join(PRESENTATIONS_DIR, `${year}.json`);

  // Read existing presentations or initialize empty array
  let presentations = [];
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      presentations = JSON.parse(content);
    } catch (err) {
      console.error(`Error reading ${filePath}: ${err.message}`);
      process.exit(1);
    }
  }

  // Create new presentation object
  const presentation = {
    title: values.title,
    event: values.event,
    date: values.date,
    description: values.description || null,
    slides: values.slides || null,
    video: values.video || null,
    slidePdf: values.pdf ? `/slides/${values.pdf}` : null,
  };

  // Add to array
  presentations.push(presentation);

  // Sort by date (newest first)
  presentations.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write back to file
  try {
    writeFileSync(filePath, JSON.stringify(presentations, null, 2) + '\n');
  } catch (err) {
    console.error(`Error writing ${filePath}: ${err.message}`);
    process.exit(1);
  }

  console.log(`\nAdded presentation to ${year}.json:`);
  console.log(JSON.stringify(presentation, null, 2));
}

async function main() {
  let values;
  try {
    const parsed = parseArgs({ options, allowPositionals: false });
    values = parsed.values;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error('Run with --help for usage information.');
    process.exit(1);
  }

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  // Check if we should run in interactive mode
  const hasRequiredArgs = values.title && values.event && values.date;
  const runInteractive = values.interactive || !hasRequiredArgs;

  if (runInteractive && !values.interactive && (values.title || values.event || values.date)) {
    // Some args provided but not all required ones - show error
    const missing = [];
    if (!values.title) missing.push('--title');
    if (!values.event) missing.push('--event');
    if (!values.date) missing.push('--date');
    console.error(`Error: Missing required arguments: ${missing.join(', ')}`);
    console.error('Run with --help for usage, or run without arguments for interactive mode.');
    process.exit(1);
  }

  if (runInteractive) {
    values = await promptInteractive();
  } else {
    // Validate date format for CLI mode
    if (!validateDate(values.date)) {
      console.error('Error: Invalid date format. Use YYYY-MM-DD (e.g., 2024-06-15)');
      process.exit(1);
    }
  }

  savePresentation(values);
}

main();
