import { APIGatewayProxyHandler } from "aws-lambda";
import { success } from "../lib/Response";

const showEvent: APIGatewayProxyHandler = async (event) => {
    return success(event);
};

export { showEvent };
