import { SNSHandler } from "aws-lambda";
import S3, { PUBLIC_PATH, TMP_PATH } from "../service/S3";

/**
 * Compress, add watermark, and move attachment to public directory
 * @param event
 */
const moveNewAttachment: SNSHandler = async (event) => {
    try {
        const { fileKeys } = JSON.parse(event.Records[0].Sns.Message);
        await Promise.all(
            fileKeys.map((fileKey) =>
                S3.moveFile(TMP_PATH + fileKey, PUBLIC_PATH + fileKey),
            ),
        );
    } catch (err) {
        console.log(err);
    }
};

export { moveNewAttachment };
