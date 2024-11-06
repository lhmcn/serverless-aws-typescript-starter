import AWS from "aws-sdk";
import {
    AdminAddUserToGroupRequest,
    AdminCreateUserRequest,
    AdminDeleteUserRequest,
    AdminRemoveUserFromGroupRequest,
    AdminSetUserPasswordRequest,
    ListUsersInGroupRequest,
    ListUsersInGroupResponse,
    ListUsersRequest,
    ListUsersResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";

const request = async (func: string, params: any): Promise<any> => {
    const cognito = new AWS.CognitoIdentityServiceProvider({
        apiVersion: "2016-04-18",
    });
    return new Promise((resolve, reject) => {
        cognito[func](params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export default class User {
    static async createUser(
        username: string,
        password: string,
        name: string,
    ): Promise<string> {
        const params: AdminCreateUserRequest = {
            UserPoolId: process.env.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "name",
                    Value: name,
                },
            ],
        };

        await request("adminCreateUser", params);

        await User.changePassword(username, password, true);

        return username;
    }

    /**
     * Admin change password for a user
     * @param Username
     * @param Password
     * @param Permanent If set false, the user will be required to change password in the first login
     */
    static async changePassword(
        Username: string,
        Password: string,
        Permanent: boolean = false,
    ): Promise<void> {
        if (!Password) return Promise.resolve(null);

        const params: AdminSetUserPasswordRequest = {
            UserPoolId: process.env.userPoolId,
            Username,
            Password,
            Permanent,
        };

        await request("adminSetUserPassword", params);
    }

    /**
     * Get a page of users
     * @param Limit
     * @param PaginationToken
     */
    static async listUsers(
        PaginationToken: string = undefined,
        Limit: number = 20,
    ): Promise<ListUsersResponse> {
        const params: ListUsersRequest = {
            UserPoolId: process.env.userPoolId,
            Limit,
            PaginationToken,
        };

        return await request("listUsers", params);
    }

    /**
     * Get all the usernames in a group
     * @param GroupName
     */
    static async getAllUsersInGroup(GroupName: string): Promise<string[]> {
        const usernames: string[] = [];

        let NextToken = undefined;
        do {
            const list = await this.listUsersInGroup(GroupName, NextToken);
            list.Users.forEach((user) => usernames.push(user.Username));
            NextToken = list.NextToken;
        } while (NextToken);

        return usernames;
    }

    /**
     * Get a page of users in a group
     * @param GroupName
     * @param NextToken
     * @private
     */
    private static async listUsersInGroup(
        GroupName: string,
        NextToken: string = undefined,
    ): Promise<ListUsersInGroupResponse> {
        const params: ListUsersInGroupRequest = {
            UserPoolId: process.env.userPoolId,
            GroupName,
            NextToken,
        };

        return request("listUsersInGroup", params);
    }

    /**
     * Add a user to a group
     * @param Username
     * @param GroupName
     */
    static async addGroup(Username: string, GroupName: string): Promise<void> {
        const params: AdminAddUserToGroupRequest = {
            UserPoolId: process.env.userPoolId,
            Username,
            GroupName,
        };

        await request("adminAddUserToGroup", params);
    }

    /**
     * Remove a user from a group
     * @param Username
     * @param GroupName
     */
    static async removeGroup(
        Username: string,
        GroupName: string,
    ): Promise<void> {
        const params: AdminRemoveUserFromGroupRequest = {
            UserPoolId: process.env.userPoolId,
            Username,
            GroupName,
        };

        await request("adminRemoveUserFromGroup", params);
    }

    /**
     * Delete a user
     * @param Username
     */
    static async remove(Username: string): Promise<void> {
        // Delete user in Cognito
        const params: AdminDeleteUserRequest = {
            UserPoolId: process.env.userPoolId,
            Username,
        };

        await request("adminDeleteUser", params);
    }
}
