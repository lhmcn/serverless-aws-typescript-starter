import {buildMessage, sendMessageToClient} from '../libs/WebSocket';
import {success} from "../libs/Response";
import {APIGatewayProxyHandler} from "aws-lambda";

export {connectionHandler, defaultHandler, pingHandler};

const connectionHandler:APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  /* Store the connectionId here */
  return success(connectionId);
}

const defaultHandler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  await sendMessageToClient(event, connectionId, buildMessage(event));
  return success();
};

const pingHandler: APIGatewayProxyHandler = async () => {
  return success('PONG');
};
