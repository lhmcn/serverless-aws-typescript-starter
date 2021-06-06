type Response = {
	statusCode: number,
	body: string,
	[x: string]: any,
}

type ResponseBody = {
	code: string,
	message: string,
	data: any,
}

type UserCredential = {
	UserPoolId: string,
	Username: string,
	IdentityId: string
}

type PaginatedItems = {
	items: any[],
	count: number,
}
