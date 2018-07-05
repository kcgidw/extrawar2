export const minUsernameLength: number = 2;
export const maxUsernameLength: number = 12;
export function validateUsername(str: string): boolean {
	var regex = /^[a-zA-Z0-9]{2,12}$/;
	return regex.test(str);
}
