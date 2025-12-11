/**
 * Get icon SVG by ID
 * @param {string} iconId - The icon ID
 * @param {Array} iconsList - Array of icon objects from the database
 * @returns {string} The SVG string or empty string if not found
 */
export function getIconById(iconId, iconsList = []) {
	if (!iconId || !iconsList || iconsList.length === 0) {
		return '';
	}
	const icon = iconsList.find(i => i.id === iconId);
	return icon?.svg || '';
}
