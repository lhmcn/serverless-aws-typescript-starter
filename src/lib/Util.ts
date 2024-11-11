import { APIGatewayProxyEvent } from "aws-lambda";
import { v7 } from "uuid";

export type UserCredential = {
    UserPoolId: string;
    sub: string;
    IdentityId: string;
};

export type PaginatedItems = {
    items: any[];
    count: number;
};

function getFileExtension(filename: string): string {
    const ext = filename.split(".").slice(-1)[0];
    return ext === filename ? "" : ext;
}

const extractUserCredential = (event: APIGatewayProxyEvent): UserCredential => {
    const credentials: UserCredential = {
        UserPoolId: "",
        sub: "",
        IdentityId: event.requestContext.identity.cognitoIdentityId,
    };

    const provider =
        event.requestContext.identity.cognitoAuthenticationProvider;
    if (provider) {
        const segments = provider.split("/")[2].split(":");
        credentials.UserPoolId = segments[0];
        credentials.sub = segments[2];
    }

    return credentials;
};

const paginate = (
    data: any[],
    page: number = 1,
    size: number = 20,
): PaginatedItems => {
    const ret = {
        items: [],
        count: 0,
    };

    if (data && Array.isArray(data) && data.length > 0) {
        ret.count = data.length;

        if (!size || size < 1) size = 20;
        const start = page && page > 1 ? (page - 1) * size : 0;
        const end = start + size;

        ret.items = data.slice(start, end);
    }

    return ret;
};

const generateID = (prefix: string = "", id?: string): string => {
    if (!id) id = v7();

    return prefix ? `${prefix}-${id}` : id;
};

const mapToObject = (value: Map<any, any>): object => {
    const obj = {};
    value.forEach((v, k) => (obj[k] = v));
    return obj;
};

export default {
    getFileExtension,
    extractUserCredential,
    paginate,
    generateID,
    mapToObject,
};
