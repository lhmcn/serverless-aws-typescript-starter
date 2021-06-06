import {buildMessage, sendMessageToClient} from "../lib/WebSocket";
import {success} from "../lib/Response";
import {APIGatewayProxyHandler} from "aws-lambda";


const connectionHandler: APIGatewayProxyHandler = async (event) => {
	const connectionId = event.requestContext.connectionId;
	/* Store the connectionId here */
	return success(connectionId);
}

const defaultHandler: APIGatewayProxyHandler = async (event) => {
	const connectionId = event.requestContext.connectionId;
	await sendMessageToClient(event, connectionId, buildMessage(event));
	return success();
};

const ping: APIGatewayProxyHandler = async () => {
	return success("PONG");
};


export {connectionHandler, defaultHandler, ping};
