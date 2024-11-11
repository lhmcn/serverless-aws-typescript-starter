import Model from "../lib/DynamoDBORM";

export default abstract class BaseModel extends Model {
    tableName: string = process.env.tableName;
    partitionKeyName: string = "PK";
    sortKeyName: string = "SK";

    PK: string = "";
    SK: string = "";
}
