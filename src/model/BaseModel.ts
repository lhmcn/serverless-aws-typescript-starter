import Model, {Key, QueryResult} from "../lib/Model";

export {QueryResult, Key};

export default abstract class BaseModel extends Model {
	tableName: string = process.env.tableName;
	partitionKeyName: string = "PK";
	sortKeyName: string = "SK";

	PK: string = "";
	SK: string = "";
}
