import { SNS } from "aws-sdk";
import { ClientConfiguration } from "aws-sdk/clients/sns";

const options: ClientConfiguration = {
    apiVersion: "2010-03-31",
};

const publish = async (Message: string, TopicArn: string): Promise<string> => {
    const sns = new SNS(options);

    const params = {
        Message,
        TopicArn,
    };

    const result = await sns.publish(params).promise();
    return result.MessageId;
};

const publishToNewAttachmentTopic = async (
    fileKeys: string[],
): Promise<string> => {
    return publish(
        JSON.stringify({ fileKeys }),
        process.env.NewAttachmentTopic,
    );
};

export default {
    publishToNewAttachmentTopic,
};
