import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// Use DATABASE_PATH environment variable to determine where to read/write data
// Local: DATABASE_PATH=./data/database.json (or not set, defaults to relative path)
// Production: DATABASE_PATH=/data/database.json (absolute path pointing to volume)
const DB_PATH = process.env.DATABASE_PATH || './data/database.json';

/**
 * Get the resolved database path, handling both relative (local) and absolute (production) paths
 * @returns {string} The resolved database file path
 */
function getDbPath() {
	let finalPath;
	if (DB_PATH.startsWith('./') || DB_PATH.startsWith('../')) {
		// Relative path - local development
		finalPath = join(process.cwd(), DB_PATH);
	} else {
		// Absolute path - production (Railway volume)
		finalPath = DB_PATH;
	}
	return finalPath;
}

/**
 * Default database structure
 */
const DEFAULT_DATABASE = {
	pages: [
		{ id: 'home', path: '/', title: 'Home', content: '' },
		{ id: 'about', path: '/about', title: 'About', content: '' },
		{ id: 'students', path: '/students', title: 'Students & Researchers', content: '' },
		{ id: 'universities', path: '/universities', title: 'Universities & Partners', content: '' },
		{ id: 'contact', path: '/contact', title: 'Contact', content: '' }
	],
	team: [],
	services: [],
	settings: {},
	icons: []
};

/**
 * Read the database from the file system
 * In production, database MUST exist - throws error instead of creating empty database
 * @returns {object} The database object
 */
export function readDatabase() {
	const dbPath = getDbPath();
	try {
		const data = readFileSync(dbPath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		const isProduction = process.env.NODE_ENV === 'production' || dbPath.startsWith('/');

		if (isProduction) {
			// In production, database MUST exist - throw error instead of creating
			throw new Error(
				`Database file not found at ${dbPath}. Please ensure the Railway volume is mounted and the database file exists.`
			);
		}

		// Only auto-initialize in development
		console.warn('[DB] Database file does not exist (development mode), initializing...');
		writeDatabase(DEFAULT_DATABASE);
		return DEFAULT_DATABASE;
	}
}

/**
 * Write the database to the file system
 * @param {object} data - The database object to write
 */
export function writeDatabase(data) {
	const dbPath = getDbPath();
	try {
		// Ensure directory exists
		const dir = dirname(dbPath);
		mkdirSync(dir, { recursive: true });

		// Write with pretty formatting
		writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
		console.log('[DB] Database written successfully to:', dbPath);
	} catch (error) {
		console.error('[DB] Failed to write database:', error.message);
		throw error;
	}
}

/**
 * Initialize the database with default structure
 * Useful for first-time setup or resetting the database
 * @returns {boolean} True if initialized, false if already exists
 */
export function initializeDatabase() {
	const dbPath = getDbPath();

	if (existsSync(dbPath)) {
		console.log('[DB] Database already exists at:', dbPath);
		return false;
	}

	writeDatabase(DEFAULT_DATABASE);
	console.log('[DB] Database initialized at:', dbPath);
	return true;
}

/**
 * Initialize the database with provided data
 * Only works if database doesn't exist (safety check)
 * @param {object} data - The database object to initialize with
 * @returns {boolean} True if initialized, false if already exists
 */
export function initializeDatabaseWithData(data) {
	const dbPath = getDbPath();

	if (existsSync(dbPath)) {
		console.log('[DB] Database already exists at:', dbPath);
		return false;
	}

	// Validate data structure
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid database data: must be an object');
	}

	// Log what we're about to write
	console.log('[DB] Initializing database with provided data:');
	console.log('[DB]   Keys:', Object.keys(data).join(', '));
	console.log('[DB]   Pages:', data.pages?.length || 0);
	console.log('[DB]   Team members:', data.team?.length || 0);
	console.log('[DB]   Services:', data.services?.length || 0);
	console.log('[DB]   Icons:', data.icons?.length || 0);
	console.log('[DB]   Settings keys:', Object.keys(data.settings || {}).length);

	writeDatabase(data);
	
	// Verify what was written by reading the file directly (avoiding readDatabase which might auto-init)
	try {
		const writtenContent = readFileSync(dbPath, 'utf-8');
		const written = JSON.parse(writtenContent);
		console.log('[DB] Verification - Written database contains:');
		console.log('[DB]   Keys:', Object.keys(written).join(', '));
		console.log('[DB]   Pages:', written.pages?.length || 0);
		console.log('[DB]   Team members:', written.team?.length || 0);
		console.log('[DB]   Services:', written.services?.length || 0);
		console.log('[DB]   Icons:', written.icons?.length || 0);
		console.log('[DB]   File size:', writtenContent.length, 'bytes');
	} catch (verifyError) {
		console.warn('[DB] Could not verify written database:', verifyError.message);
	}
	
	console.log('[DB] Database initialized with provided data at:', dbPath);
	return true;
}

/**
 * Get the current database path (useful for debugging)
 * @returns {string} The resolved database path
 */
export function getDatabasePath() {
	return getDbPath();
}
