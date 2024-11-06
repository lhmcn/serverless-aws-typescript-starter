import QueryBuilder from "./QueryBuilder";
import { DynamoDB } from "aws-sdk";
import QueryResult from "./QueryResult";
import PageKey from "./PageKey";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

export { QueryResult, PageKey };

const db = new DynamoDB.DocumentClient();

const keyDataTypes: any = {
    string: "S",
    number: "N",
};

/**
 * Properties to be excluded from the data item
 */
const noneDataProperties: ReadonlySet<string> = new Set<string>([
    "tableName",
    "indexName",
    "partitionKeyName",
    "sortKeyName",
]);

export default abstract class Model {
    /**
     * The DynamoDB table name (required)
     */
    abstract tableName: string;

    /**
     * The index name
     * Set to empty string if no index used
     */
    abstract indexName: string;

    /**
     * Name of the partition key (required)
     * If indexName is provided, must be the partition key of the index
     */
    abstract partitionKeyName: string;

    /**
     * Name of the sort key
     * If indexName is provided, must be the sort key of the index
     */
    abstract sortKeyName: string;

    /**
     * Automatically updated when items are created
     * Delete this property in sub-classes' constructors if you don't need it
     */
    createdAt: number;

    /**
     * Automatically updated when items are created or updated
     * Delete this property in sub-classes' constructors if you don't need it
     */
    updatedAt: number;

    constructor() {
        this.createdAt = -1;
        this.updatedAt = -1;
    }

    /**
     * Build an item from the instance for storage
     * @private
     */
    private buildItem(): DocumentClient.PutItemInputAttributeMap {
        // Check partition key
        if (
            !keyDataTypes[typeof this[this.partitionKeyName]] ||
            !this[this.partitionKeyName]
        ) {
            throw "Partition key is required";
        }

        // Check sort key
        if (
            this.sortKeyName &&
            (!keyDataTypes[typeof this[this.sortKeyName]] ||
                !this[this.sortKeyName])
        ) {
            throw "Sort key is required";
        }

        // Create an empty item
        const item: DocumentClient.PutItemInputAttributeMap = {};

        // Fill the item with value from current instance
        Model.fillItem(this, item, this, true, 1);

        const now = Date.now();

        // Update time
        if (this.createdAt && this.createdAt < 0) {
            item["createdAt"] = now;
        }

        if (this.updatedAt) {
            item["updatedAt"] = now;
        }

        return item;
    }

    /**
     * Save or update the instance to database
     */
    async save(): Promise<void> {
        // If the item is from indices, throw an exception
        if (this.indexName) {
            throw "Items from indices are read-only";
        }

        // If the tablename is empty, throw an exception
        if (!this.tableName) {
            throw "Items must keep none-data properties";
        }

        const param: DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: this.buildItem(),
        };

        // Send put request to database
        await db.put(param).promise();

        // Update current instance
        if (this.updatedAt) {
            this.updatedAt = param.Item.updatedAt;
        }
    }

    /**
     * Deletes the current item
     */
    async delete(): Promise<void> {
        // If the tablename is deleted, throw an exception
        if (!this.tableName) {
            throw "Items must keep none-data properties";
        }

        // The request params
        const params: DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                [this.partitionKeyName]: this[this.partitionKeyName],
            },
        };

        // Add the sort key if configured
        if (this.sortKeyName) {
            if (this[this.sortKeyName]) {
                params.Key[this.sortKeyName] = this[this.sortKeyName];
            } else {
                throw "Sort key value is required";
            }
        }

        // Send delete request to database
        await db.delete(params).promise();
    }

    /**
     * Get a new instance
     */
    newInstance<T extends Model>(): T {
        // @ts-ignore
        return new this.constructor();
    }

    /**
     * Get a copy of the instance
     */
    clone<T extends Model>(): T {
        const newInstance: T = this.newInstance();
        Model.fillItem(this, newInstance, newInstance);
        return newInstance;
    }

    /**
     * Finds and returns a single item matching the key
     * @param partitionKeyValue Value of the partition key
     * @param sortKeyValue Value of the sort key
     * @param deleteNoneDataProperties Delete none-data properties in the result item
     * @return Returns the single item
     * @throws Throws item not found exception if no item is found
     */
    static async find<T extends Model>(
        partitionKeyValue: any,
        sortKeyValue: any = "",
        deleteNoneDataProperties: boolean = true,
    ): Promise<T> {
        // @ts-ignore
        const returnItem: T = new this();

        if (returnItem.indexName) {
            const result = await this.queryBuilder<T>()
                .partitionKeyEquals(partitionKeyValue)
                .sortKeyEquals(sortKeyValue)
                .query(deleteNoneDataProperties);
            if (result.Items.length > 0) {
                return result.Items[0];
            }
        } else {
            // The request params
            const params: DocumentClient.GetItemInput = {
                TableName: returnItem.tableName,
                Key: {
                    [returnItem.partitionKeyName]: partitionKeyValue,
                },
            };

            // Add the sort key if configured
            if (returnItem.sortKeyName) {
                if (sortKeyValue) {
                    params.Key[returnItem.sortKeyName] = sortKeyValue;
                } else {
                    throw "Sort key value is required";
                }
            }

            // Get item from the database
            const data = await db.get(params).promise();
            if (data.Item) {
                // Fill the item with database result
                this.fillItem(
                    data.Item,
                    returnItem,
                    returnItem,
                    deleteNoneDataProperties,
                    2,
                );
                return returnItem;
            }
        }

        throw "Item not found";
    }

    /**
     * Finds and returns a single item matching the key
     * @param partitionKeyValue Value of the partition key
     * @param sortKeyValue Value of the sort key
     * @param defaultValue The default value
     * @param deleteNoneDataProperties Delete none-data properties in the result item
     * @return Returns the single item, or the default value if no item is found
     */
    static async findOrDefault<T extends Model>(
        partitionKeyValue: any,
        sortKeyValue: any = "",
        defaultValue: T = null,
        deleteNoneDataProperties: boolean = true,
    ): Promise<T> {
        try {
            return await this.find(
                partitionKeyValue,
                sortKeyValue,
                deleteNoneDataProperties,
            );
        } catch (e) {
            if (e === "Item not found") {
                return defaultValue;
            } else {
                throw e;
            }
        }
    }

    /**
     * Deletes a single item matching the key
     * @param partitionKeyValue Value of the partition key
     * @param sortKeyValue Value of the sort key
     */
    static async delete<T extends Model>(
        partitionKeyValue: any,
        sortKeyValue: any = "",
    ): Promise<void> {
        // @ts-ignore
        const deletedItem: T = new this();

        deletedItem[deletedItem.partitionKeyName] = partitionKeyValue;
        deletedItem[deletedItem.sortKeyName] = sortKeyValue;

        await deletedItem.delete();
    }

    /**
     * Gets the query builder
     * @return Returns the query builder
     */
    static queryBuilder<T extends Model>(): QueryBuilder<T> {
        // @ts-ignore
        const model: T = new this();

        return new QueryBuilder<T>(model);
    }

    /**
     * Assign values from source item to target item
     * @param itemFrom The source item
     * @param itemTo The target item
     * @param itemTemplate The template with default values of the item
     * @param deleteNoneDataProperties Delete none-data properties in the result item
     * @param dynamoDBFlag 0 = n/a, 1 = to DynamoDB, 2 = from DynamoDB
     */
    static fillItem<T extends Model>(
        itemFrom: any,
        itemTo: any,
        itemTemplate: T,
        deleteNoneDataProperties: boolean = true,
        dynamoDBFlag: number = 0,
    ) {
        Object.getOwnPropertyNames(itemTemplate).forEach((k) => {
            if (!noneDataProperties.has(k)) {
                if (dynamoDBFlag === 1) {
                    itemTo[k] = this.toDynamoDBValue(itemFrom[k]);
                } else if (dynamoDBFlag === 2) {
                    itemTo[k] = this.fromDynamoDBValue(
                        itemFrom[k],
                        itemTemplate[k],
                    );
                } else if (this.isEmpty(itemFrom[k])) {
                    // use the default value
                    itemTo[k] = itemTemplate[k];
                } else {
                    itemTo[k] = itemFrom[k];
                }
            } else if (deleteNoneDataProperties) {
                delete itemTo[k];
            }
        });

        if (itemTemplate.createdAt) {
            itemTo["createdAt"] = itemFrom["createdAt"];
        }

        if (itemTemplate.updatedAt) {
            itemTo["updatedAt"] = itemFrom["updatedAt"];
        }
    }

    /**
     * Converts the value to DynamoDB type
     * @param value The value to be converted
     */
    static toDynamoDBValue(value: any): any {
        if (this.isEmpty(value)) {
            return undefined;
        }

        if (value instanceof Set) {
            return db.createSet([...value]);
        }

        if (value instanceof Map) {
            const obj = {};
            value.forEach((v, k) => (obj[k] = v));
            return obj;
        }

        return value;
    }

    /**
     * Converts the value from DynamoDB type
     * @param value The value to be converted
     * @param defaultValue The default value if empty
     */
    static fromDynamoDBValue(value: any, defaultValue: any): any {
        if (value === undefined) {
            return defaultValue;
        }

        if (defaultValue instanceof Set || value.wrapperName === "Set") {
            return new Set(value.values);
        }

        if (defaultValue instanceof Map) {
            const map = new Map();
            Object.keys(value).forEach((k) => {
                map.set(k, value[k]);
            });
            return map;
        }

        return value;
    }

    /**
     * Checks if a value is empty
     * @param value The value to be checked
     */
    static isEmpty(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }

        if (value instanceof Set) {
            return value.size === 0;
        }

        if (value instanceof Map) {
            return value.size === 0;
        }

        switch (typeof value) {
            case "object":
                return Object.keys(value).length === 0;
            case "string":
                return value.length === 0;
            default:
                return false;
        }
    }
}
