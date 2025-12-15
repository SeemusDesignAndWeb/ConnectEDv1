import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

/**
 * POST /api/contact
 * Send contact form email via Resend
 */
export async function POST({ request }) {
	try {
		const { name, email, organization, type, message, website } = await request.json();

		// Honeypot spam protection - if website field is filled, it's a bot
		if (website && website.trim() !== '') {
			console.log('[API] Spam detected: honeypot field filled');
			// Silently reject - return success to bot but don't send email
			return json({ success: true });
		}

		// Validate required fields
		if (!name || !email || !type || !message) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Get Resend API key from environment
		const resendApiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
		if (!resendApiKey) {
			console.error('[API] RESEND_API_KEY not set in environment variables');
			return json(
				{
					error: 'Email service not configured',
					hint: 'RESEND_API_KEY must be set in environment variables'
				},
				{ status: 500 }
			);
		}

		// Get email configuration from environment variables
		const fromEmail = env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
		const toEmail = env.RESEND_TO_EMAIL || process.env.RESEND_TO_EMAIL;

		if (!fromEmail || !toEmail) {
			console.error('[API] RESEND_FROM_EMAIL or RESEND_TO_EMAIL not set in environment variables');
			return json(
				{
					error: 'Email configuration incomplete',
					hint: 'RESEND_FROM_EMAIL and RESEND_TO_EMAIL must be set in environment variables'
				},
				{ status: 500 }
			);
		}

		// Initialize Resend
		const resend = new Resend(resendApiKey);

		// Format the email content
		const emailSubject = `New Contact Form Submission: ${type}`;
		const emailHtml = `
			<h2>New Contact Form Submission</h2>
			<p><strong>Name:</strong> ${name}</p>
			<p><strong>Email:</strong> ${email}</p>
			${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
			<p><strong>Type:</strong> ${type}</p>
			<hr>
			<p><strong>Message:</strong></p>
			<p>${message.replace(/\n/g, '<br>')}</p>
		`;

		// Send email
		const { data, error } = await resend.emails.send({
			from: fromEmail,
			to: toEmail,
			replyTo: email,
			subject: emailSubject,
			html: emailHtml
		});

		if (error) {
			console.error('[API] Resend error:', error);
			return json({ error: 'Failed to send email' }, { status: 500 });
		}

		console.log('[API] Contact form email sent successfully:', data?.id);

		return json({ success: true, messageId: data?.id });
	} catch (error) {
		console.error('[API] Contact form error:', error);
		return json({ error: 'Failed to process contact form' }, { status: 500 });
	}
}

