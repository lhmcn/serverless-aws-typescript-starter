import {ApiGatewayManagementApi} from "aws-sdk";
import {buildResponseBody as buildMessage} from "./Response";

export {buildMessage, sendMessageToClient};

const sendMessageToClient = (event: any, connectionId: string, message: ResponseBody): Promise<any> =>
	new Promise((resolve, reject) => {
		const apiGateway = new ApiGatewayManagementApi({
			apiVersion: "2018-11-29",
			endpoint: getUrl(event),
		});

		apiGateway.postToConnection(
			{
				ConnectionId: connectionId,
				Data: JSON.stringify(message),
			},
			(err, data) => {
				if (err) {
					console.log("[ERROR]", err);
					reject(err);
				}
				resolve(data);
			},
		);
	});

const getUrl = (event: any): string => {
	const domain = event.requestContext.domainName;
	const stage = event.requestContext.stage;
	return `https://${domain}/${stage}`;
}
