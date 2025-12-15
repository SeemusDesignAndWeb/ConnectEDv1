import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/**
 * GET /api/admin/debug
 * Debug endpoint to check if ADMIN_PASSWORD is being read (without exposing the actual password)
 */
export async function GET() {
	try {
		// Try both methods
		const dynamicEnvPassword = env.ADMIN_PASSWORD;
		const processEnvPassword = process.env.ADMIN_PASSWORD;
		const adminPassword = dynamicEnvPassword || processEnvPassword;
		
		return json({
			hasDynamicEnvPassword: !!dynamicEnvPassword,
			hasProcessEnvPassword: !!processEnvPassword,
			hasAdminPassword: !!adminPassword,
			passwordLength: adminPassword ? adminPassword.length : 0,
			passwordFirstChar: adminPassword ? adminPassword.charAt(0) : null,
			passwordLastChar: adminPassword ? adminPassword.charAt(adminPassword.length - 1) : null,
			hasSpecialChars: adminPassword ? /[!@#$%^&*(),.?":{}|<>]/.test(adminPassword) : false,
			// Don't expose the actual password, just check if it exists and its characteristics
			note: 'This endpoint helps debug environment variable loading. Restart dev server after changing .env file.',
			troubleshooting: [
				'1. Make sure .env file exists in project root',
				'2. Format: ADMIN_PASSWORD=TheRootOfTheTree! (no quotes needed unless password contains spaces)',
				'3. Restart the dev server after changing .env',
				'4. Check server console for environment variable loading messages'
			]
		});
	} catch (error) {
		return json({ 
			error: error.message,
			note: 'Error accessing environment variables'
		}, { status: 500 });
	}
}

