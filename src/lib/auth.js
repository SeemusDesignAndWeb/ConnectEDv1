import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * Simple session management using cookies
 * In production, consider using a more secure session store
 */

const SESSION_COOKIE_NAME = 'admin_session';

// Get admin password from environment
// Use $env/dynamic/private for runtime environment variables from .env files
function getAdminPassword() {
	// Try both methods - dynamic env (works with .env files) and process.env (fallback)
	return env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
}

const SESSION_SECRET = getAdminPassword() || 'default-secret-change-in-production';

/**
 * Verify admin password
 */
export function verifyPassword(password) {
	const adminPassword = getAdminPassword();
	
	if (!adminPassword) {
		console.error('[AUTH] ADMIN_PASSWORD not set in environment variables');
		console.error('[AUTH] Check .env file and restart server');
		return false;
	}
	
	// Convert to strings and trim whitespace (exact match, case-sensitive)
	const providedPassword = String(password).trim();
	const expectedPassword = String(adminPassword).trim();
	
	// Detailed comparison logging
	const matches = providedPassword === expectedPassword;
	
	if (!matches) {
		console.log('[AUTH] Password comparison failed:');
		console.log('[AUTH]   Provided length:', providedPassword.length);
		console.log('[AUTH]   Expected length:', expectedPassword.length);
		console.log('[AUTH]   Provided first char:', JSON.stringify(providedPassword.charAt(0)));
		console.log('[AUTH]   Expected first char:', JSON.stringify(expectedPassword.charAt(0)));
		console.log('[AUTH]   Provided last char:', JSON.stringify(providedPassword.charAt(providedPassword.length - 1)));
		console.log('[AUTH]   Expected last char:', JSON.stringify(expectedPassword.charAt(expectedPassword.length - 1)));
		console.log('[AUTH]   Provided (safe):', providedPassword.substring(0, 5) + '...');
		console.log('[AUTH]   Expected (safe):', expectedPassword.substring(0, 5) + '...');
		
		// Check character by character for first few chars
		for (let i = 0; i < Math.min(5, Math.max(providedPassword.length, expectedPassword.length)); i++) {
			const pChar = providedPassword.charAt(i);
			const eChar = expectedPassword.charAt(i);
			if (pChar !== eChar) {
				console.log(`[AUTH]   First difference at position ${i}: provided="${JSON.stringify(pChar)}" (code: ${pChar.charCodeAt(0)}), expected="${JSON.stringify(eChar)}" (code: ${eChar.charCodeAt(0)})`);
				break;
			}
		}
	} else {
		console.log('[AUTH] Password match successful');
	}
	
	return matches;
}

/**
 * Create a simple session token
 */
function createSessionToken() {
	// Simple token based on timestamp and secret
	// In production, use a proper JWT or session library
	const timestamp = Date.now();
	return Buffer.from(`${timestamp}:${SESSION_SECRET}`).toString('base64');
}

/**
 * Verify session token
 */
function verifySessionToken(token) {
	try {
		const decoded = Buffer.from(token, 'base64').toString('utf-8');
		const [timestamp, secret] = decoded.split(':');
		
		// Check if session is valid (24 hours)
		const age = Date.now() - parseInt(timestamp);
		if (age > 24 * 60 * 60 * 1000) {
			return false;
		}
		
		return secret === SESSION_SECRET;
	} catch {
		return false;
	}
}

/**
 * Get session from cookies
 */
export function getSession(cookies) {
	const sessionToken = cookies.get(SESSION_COOKIE_NAME);
	if (!sessionToken) {
		return null;
	}
	
	return verifySessionToken(sessionToken) ? sessionToken : null;
}

/**
 * Set session cookie
 */
export function setSession(cookies) {
	const token = createSessionToken();
	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 // 24 hours
	});
	return token;
}

/**
 * Clear session cookie
 */
export function clearSession(cookies) {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Require admin authentication
 * Returns true if authenticated, false otherwise
 * Use checkAuth for API endpoints (returns boolean)
 * Use requireAuth for page routes (throws redirect)
 */
export function checkAuth(cookies) {
	const session = getSession(cookies);
	return !!session;
}

/**
 * Require admin authentication (for page routes)
 * Throws redirect if not authenticated
 */
export function requireAuth(cookies) {
	const session = getSession(cookies);
	if (!session) {
		throw redirect(302, '/admin/login');
	}
	return true;
}

