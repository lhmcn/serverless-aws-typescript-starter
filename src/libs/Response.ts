export {IResponseBody, buildResponseBody, success, requestError, serverError};

interface IResponse {
  statusCode: number,
  body: string,

  [x: string]: any,
}

interface IResponseBody {
  code: string,
  message: string,
  data: any,
}

const buildResponse = (statusCode: number, body: IResponseBody): IResponse => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "*",
  },
  body: JSON.stringify(body),
});

const buildResponseBody = (data: any, code:string = '', message: string = ''): IResponseBody => ({
  code,
  message,
  data,
});

const errorResponse = (statusCode: number, code: string, message: string, data: any = {}):IResponse =>
  buildResponse(statusCode, buildResponseBody(data, code, message))

const success = (data: any = {}): IResponse =>
  buildResponse(200, buildResponseBody(data));

const requestError = (code: string, message: string, data: any = {}): IResponse =>
  errorResponse(400, code, message, data);

const serverError = (code: string, message: string, data: any = {}): IResponse =>
  errorResponse(500, code, message, data);
