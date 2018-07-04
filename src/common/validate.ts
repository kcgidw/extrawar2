
export function validateUsername(str: string): boolean {
	// alphanumeric, 4-8 chars
	var regex = /^[a-zA-Z0-9]{4,8}$/;
	return regex.test(str);
}
