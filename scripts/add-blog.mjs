#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_FILE = join(__dirname, '..', 'src', 'data', 'blog.json');

const options = {
  title: { type: 'string', short: 't' },
  description: { type: 'string', short: 'd' },
  date: { type: 'string' },
  url: { type: 'string', short: 'u' },
  interactive: { type: 'boolean', short: 'i' },
  help: { type: 'boolean', short: 'h' },
};

function showHelp() {
  console.log(`
Usage: npm run add-blog -- [options]

Modes:
  (no args)          Interactive mode - prompts for each field
  -i, --interactive  Interactive mode (explicit)

Required (in CLI mode):
  -t, --title        Blog post title
  -d, --description  Short description of the post
  --date             Publish date (YYYY-MM format)
  -u, --url          URL to the blog post

Optional:
  -h, --help         Show this help message

Examples:
  npm run add-blog                    # Interactive mode
  npm run add-blog -- -t "My Post" -d "Description" --date "2024-01" -u "https://..."
`);
}

function validateDate(dateStr) {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  const [year, month] = dateStr.split('-').map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
}

async function promptInteractive() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\nAdd a new blog post\n');

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
  values.description = await prompt('Description (required): ', true);
  values.date = await prompt('Publish date (YYYY-MM, required): ', true, validateDate);
  values.url = await prompt('URL (required): ', true);

  rl.close();
  return values;
}

function saveBlogPost(values) {
  // Read existing blog posts
  let posts = [];
  try {
    const content = readFileSync(BLOG_FILE, 'utf-8');
    posts = JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${BLOG_FILE}: ${err.message}`);
    process.exit(1);
  }

  // Create new blog post object
  const post = {
    title: values.title,
    description: values.description,
    date: values.date,
    url: values.url,
  };

  // Add to array
  posts.push(post);

  // Sort by date (newest first)
  posts.sort((a, b) => b.date.localeCompare(a.date));

  // Write back to file
  try {
    writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2) + '\n');
  } catch (err) {
    console.error(`Error writing ${BLOG_FILE}: ${err.message}`);
    process.exit(1);
  }

  console.log('\nAdded blog post:');
  console.log(JSON.stringify(post, null, 2));
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
  const hasRequiredArgs = values.title && values.description && values.date && values.url;
  const runInteractive = values.interactive || !hasRequiredArgs;

  if (runInteractive && !values.interactive && (values.title || values.description || values.date || values.url)) {
    // Some args provided but not all required ones - show error
    const missing = [];
    if (!values.title) missing.push('--title');
    if (!values.description) missing.push('--description');
    if (!values.date) missing.push('--date');
    if (!values.url) missing.push('--url');
    console.error(`Error: Missing required arguments: ${missing.join(', ')}`);
    console.error('Run with --help for usage, or run without arguments for interactive mode.');
    process.exit(1);
  }

  if (runInteractive) {
    values = await promptInteractive();
  } else {
    // Validate date format for CLI mode
    if (!validateDate(values.date)) {
      console.error('Error: Invalid date format. Use YYYY-MM (e.g., 2024-01)');
      process.exit(1);
    }
  }

  saveBlogPost(values);
}

main();
