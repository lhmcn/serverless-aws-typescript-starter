const buildResponse = (statusCode: number, body: ResponseBody): Response => ({
	statusCode: statusCode,
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": true,
		"Access-Control-Allow-Methods": "*",
	},
	body: JSON.stringify(body),
});

const buildResponseBody = (data: any, code: string = "", message: string = ""): ResponseBody => ({
	code,
	message,
	data,
});

const errorResponse = (statusCode: number, code: string = "", message: string = "", data: any = {}): Response =>
	buildResponse(statusCode, buildResponseBody(data, code, message))

const success = (data: any = {}): Response =>
	buildResponse(200, buildResponseBody(data));

const requestError = (code: string, message: string, data: any = {}): Response =>
	errorResponse(200, code, message, data);

const forbidden = (): Response =>
	errorResponse(403, "", "", "");

const notFound = (): Response =>
	errorResponse(404, "", "", "");

const serverError = (code: string = "ServerErrorUnknown", message: string = "An error occurred on the server, please contact the technical support", data: any = {}): Response =>
	errorResponse(500, code, message, data);

export {
	buildResponseBody,
	success,
	requestError,
	forbidden,
	notFound,
	serverError,
	errorResponse,
};
