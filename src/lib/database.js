import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/database.json';

/**
 * Get the resolved database path, handling both relative (local) and absolute (production) paths
 * @returns {string} The resolved database file path
 */
function getDbPath() {
	let finalPath;
	if (DB_PATH.startsWith('./') || DB_PATH.startsWith('../')) {
		// Relative path - resolve from project root (local development)
		finalPath = join(process.cwd(), DB_PATH);
	} else {
		// Absolute path (e.g., /data/database.json for Railway volumes)
		finalPath = DB_PATH;
	}

	// Ensure the directory exists
	const dir = dirname(finalPath);
	try {
		mkdirSync(dir, { recursive: true });
	} catch (error) {
		// Directory might already exist, or volume might not be mounted yet (during build)
		console.warn('[DB] Could not create directory:', error.message);
	}

	return finalPath;
}

/**
 * Default database structure
 */
const DEFAULT_DATABASE = {
	pages: [],
	team: [],
	services: [],
	settings: {}
};

/**
 * Read the database from the file system
 * @returns {object} The database object
 */
export function readDatabase() {
	const dbPath = getDbPath();
	try {
		if (!existsSync(dbPath)) {
			const isProduction = process.env.NODE_ENV === 'production' || dbPath.startsWith('/');

			if (isProduction) {
				// In production, database must exist on the volume
				console.error('[DB] CRITICAL: Database file not found in production at:', dbPath);
				throw new Error(
					`Database file not found at ${dbPath}. Please ensure the Railway volume is mounted and initialize the database.`
				);
			}

			// Only auto-initialize in development
			console.warn('[DB] Database file does not exist (development mode), initializing...');
			writeDatabase(DEFAULT_DATABASE);
			return DEFAULT_DATABASE;
		}

		const data = readFileSync(dbPath, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		const isProduction = process.env.NODE_ENV === 'production' || dbPath.startsWith('/');

		if (isProduction) {
			console.error('[DB] CRITICAL: Failed to read database in production:', error.message);
			throw new Error(
				`Failed to read database at ${dbPath}. Please check file permissions and volume mount.`
			);
		}

		// In development, try to initialize if read fails
		console.warn('[DB] Failed to read database, initializing with defaults:', error.message);
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
		const isProduction = process.env.NODE_ENV === 'production' || dbPath.startsWith('/');

		if (isProduction) {
			console.error('[DB] CRITICAL: Failed to write database in production:', error.message);
			throw new Error(
				`Failed to write database at ${dbPath}. Please check file permissions and volume mount.`
			);
		}

		console.error('[DB] Failed to write database:', error.message);
		throw error;
	}
}

/**
 * Initialize the database with default structure
 * Useful for first-time setup or resetting the database
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
 * Get the current database path (useful for debugging)
 * @returns {string} The resolved database path
 */
export function getDatabasePath() {
	return getDbPath();
}
