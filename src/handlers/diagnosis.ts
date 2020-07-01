import {APIGatewayProxyHandler} from 'aws-lambda';
import {success} from "../libs/Response";

export {showEvent};

const showEvent: APIGatewayProxyHandler = async (event) => {
  return success(event);
};
