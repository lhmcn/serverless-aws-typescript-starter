import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    PreSignUpTriggerHandler,
} from "aws-lambda";
import { serverError, success } from "../lib/Response";
import User from "../model/User";

const GROUP_NAME_ADMIN = "Administrators";

/**
 * Confirms the new cognito user
 * @param event
 * @param _context
 * @param callback
 */
const autoConfirmUser: PreSignUpTriggerHandler = (
    event,
    _context,
    callback,
) => {
    event.response.autoConfirmUser = true;
    callback(null, event);
};

/**
 * Gets the administrators
 * @return Returns the usernames
 */
const rootGetAllAdministrators: APIGatewayProxyHandler = async () => {
    return getAllUsersInGroup(GROUP_NAME_ADMIN);
};

/**
 * Gets the users in a group
 * @param groupName The group name
 * @return Returns the usernames
 */
const getAllUsersInGroup = async (
    groupName: string,
): Promise<APIGatewayProxyResult> => {
    try {
        const usernames: string[] = await User.getAllUsersInGroup(groupName);
        return success(usernames);
    } catch (e) {
        console.log(e);
        return serverError(e.code, e.message);
    }
};

/**
 * Adds a user to the administrators group
 * @return Returns the username
 */
const rootAddUserToAdminGroup: APIGatewayProxyHandler = (event) => {
    return addUserToGroup(event, GROUP_NAME_ADMIN);
};

/**
 * Adds a user to a group
 * @param event
 * @param groupName The group name
 * @return Returns the username
 */
const addUserToGroup = async (
    event: APIGatewayProxyEvent,
    groupName: string,
): Promise<APIGatewayProxyResult> => {
    const username = event.pathParameters.username;

    try {
        await User.addGroup(username, groupName);
        return success(username);
    } catch (e) {
        console.log(e);
        return serverError(e.code, e.message);
    }
};

/**
 * Removes a user from the administrators group
 * @return Returns the username
 */
const rootRemoveUserFromAdminGroup: APIGatewayProxyHandler = (event) => {
    return removeUserFromGroup(event, GROUP_NAME_ADMIN);
};

/**
 * Removes a user from a group
 * @param event
 * @param groupName The group name
 * @return Returns the username
 */
const removeUserFromGroup = async (
    event: APIGatewayProxyEvent,
    groupName: string,
): Promise<APIGatewayProxyResult> => {
    const username = event.pathParameters.username;

    try {
        await User.removeGroup(username, groupName);
        return success(username);
    } catch (e) {
        console.log(e);
        return serverError(e.code, e.message);
    }
};

/**
 * Create a user
 * @param event
 */
const createUser = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { username, password, name } = JSON.parse(event.body);

    try {
        await User.createUser(username, password, name);
        return success(username);
    } catch (e) {
        console.log(e);
        return serverError(e.code, e.message);
    }
};

const listUser = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const page = event.queryStringParameters?.page;

    try {
        const users = await User.listUsers(page);
        return success(users);
    } catch (e) {
        console.log(e);
        return serverError(e.code, e.message);
    }
};

export {
    autoConfirmUser,
    rootGetAllAdministrators,
    rootAddUserToAdminGroup,
    rootRemoveUserFromAdminGroup,
    createUser,
    listUser,
};
