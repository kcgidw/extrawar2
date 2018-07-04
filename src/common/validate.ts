export const maxUsernameLength: number = 12;
export function validateUsername(str: string): boolean {
	// alphanumeric, 3-12 chars
	var regex = /^[a-zA-Z0-9]{3,12}$/;
	return regex.test(str);
}
