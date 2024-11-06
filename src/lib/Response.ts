import { APIGatewayProxyResult } from "aws-lambda";

type ResponseBody = {
    code: string;
    message: string;
    data: any;
};

const buildResponse = (
    statusCode: number,
    body: ResponseBody,
): APIGatewayProxyResult => ({
    statusCode: statusCode,
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": true,
		"Access-Control-Allow-Methods": "*",
	},
    body: JSON.stringify(body),
});

const buildResponseBody = (
    data: any,
    code: string = "",
    message: string = "",
): ResponseBody => ({
    code,
    message,
    data,
});

const errorResponse = (
    statusCode: number,
    code: string = "",
    message: string = "",
    data: any = {},
): APIGatewayProxyResult =>
    buildResponse(statusCode, buildResponseBody(data, code, message));

const success = (data: any = {}): APIGatewayProxyResult =>
    buildResponse(200, buildResponseBody(data));

const requestError = (
    code: string,
    message: string,
    data: any = {},
): APIGatewayProxyResult => errorResponse(200, code, message, data);

const forbidden = (): APIGatewayProxyResult => errorResponse(403, "", "", "");

const notFound = (): APIGatewayProxyResult => errorResponse(404, "", "", "");

const serverError = (
    code: string = "ServerErrorUnknown",
    message: string = "An error occurred on the server, please contact the technical support",
    data: any = {},
): APIGatewayProxyResult => errorResponse(500, code, message, data);

export {
    ResponseBody,
    buildResponseBody,
    success,
    requestError,
    forbidden,
    notFound,
    serverError,
    errorResponse,
};
