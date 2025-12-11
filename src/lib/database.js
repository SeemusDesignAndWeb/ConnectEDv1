import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// Use DATA_STORE env variable, fallback to DATABASE_PATH for backwards compatibility, then default
// Prefer the mounted volume in production if no env is provided
// Also check for Railway volume mount path
const railwayMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
const defaultStore =
	railwayMountPath || (process.env.NODE_ENV === 'production' ? '/data' : './data');

const DATA_STORE =
	process.env.DATA_STORE || process.env.DATABASE_PATH || defaultStore;

const DB_PATH = DATA_STORE.endsWith('.json')
	? DATA_STORE 
	: `${DATA_STORE}/database.json`;

/**
 * Determine if we're in production based on environment and path
 */
function isProductionEnvironment() {
	// Check NODE_ENV first
	if (process.env.NODE_ENV === 'production') {
		return true;
	}
	
	// Check if DATA_STORE is set to a production volume path (like /DATA or /data)
	// DATA_STORE is already defined above from process.env
	if (DATA_STORE && (DATA_STORE === '/DATA' || DATA_STORE === '/data' || DATA_STORE.startsWith('/DATA/') || DATA_STORE.startsWith('/data/'))) {
		return true;
	}
	
	return false;
}

/**
 * Get the resolved database path, handling both relative (local) and absolute (production) paths
 * @returns {string} The resolved database file path
 */
function getDbPath() {
	let finalPath;
	if (DB_PATH.startsWith('./') || DB_PATH.startsWith('../')) {
		// Relative path - resolve from project root (local development)
		finalPath = join(process.cwd(), DB_PATH);
	} else if (DB_PATH.startsWith('/')) {
		// Absolute path - use as-is (could be production volume or local absolute path)
		finalPath = DB_PATH;
	} else {
		// Relative path without ./ - resolve from project root
		finalPath = join(process.cwd(), DB_PATH);
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
 * @returns {object} The database object
 */
export function readDatabase() {
	const dbPath = getDbPath();
	const isProduction = isProductionEnvironment();
	
	try {
		if (!existsSync(dbPath)) {
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
	const isProduction = isProductionEnvironment();
	
	try {
		// Ensure directory exists
		const dir = dirname(dbPath);
		mkdirSync(dir, { recursive: true });

		// Write with pretty formatting
		writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
		console.log('[DB] Database written successfully to:', dbPath);
	} catch (error) {
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
