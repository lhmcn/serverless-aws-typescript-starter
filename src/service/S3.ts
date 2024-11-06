import { S3 } from "aws-sdk";

export const PUBLIC_PATH: string = "public/";
export const TMP_PATH: string = `${PUBLIC_PATH}tmp/`;

const s3 = new S3();

const fileExists = async (Key: string): Promise<boolean> => {
    const params: S3.HeadObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key,
    };

    try {
        await s3.headObject(params).promise();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

const getFile = async (Key: string): Promise<Buffer> => {
    const params: S3.GetObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key,
    };

    const file = await s3.getObject(params).promise();
    return file.Body as Buffer;
};

const putFile = async (
    Key: string,
    Body: Buffer | NodeJS.WritableStream,
): Promise<S3.PutObjectOutput> => {
    const putRequest: S3.PutObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key,
        Body,
    };

    return await s3.upload(putRequest).promise();
};

const copyFile = async (
    sourceKey: string,
    destinationKey: string,
): Promise<S3.CopyObjectOutput> => {
    const params: S3.CopyObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        CopySource: `${process.env.S3_BUCKET}/${sourceKey}`,
        Key: destinationKey,
    };

    return await s3.copyObject(params).promise();
};

const moveFile = async (
    sourceKey: string,
    destinationKey: string,
): Promise<boolean> => {
    await copyFile(sourceKey, destinationKey);
    await deleteFile(sourceKey);
    return true;
};

const deleteFile = async (Key: string): Promise<S3.DeleteObjectOutput> => {
    const params: S3.DeleteObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key,
    };

    return await s3.deleteObject(params).promise();
};

const getUrl = (Key: string): Promise<string> => {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key,
    };
    return s3.getSignedUrlPromise("getObject", params);
};

export default {
    fileExists,
    getFile,
    putFile,
    copyFile,
    moveFile,
    deleteFile,
    getUrl,
};
