import {DynamoDB} from 'aws-sdk';

const call = async (action, params) => {
  params.TableName = process.env.tableName;
  const dynamoDb = new DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
};

export default {call};
