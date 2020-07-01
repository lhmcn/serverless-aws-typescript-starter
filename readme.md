# AWS Serverless Starter Kit for TypeScript

This is a pre-configured starter kit for AWS serverless developers.



**Language:** TypeScript (works for ES6 too)



**Pre-configured AWS Services:**

- DynamoDB

- Cognito User Pool

- Cognito Identity Pool

- S3 bucket for attachment

  

**Implemented Serverless Plugins:**

  - serverless-dotenv-plugin (for loading .env configurations)
  - serverless-offline (for running locally)
  - serverless-prune-plugin (for optimizing deployment)



**Pre-requisitions:**

- npm or yarn installed
  - [npm installation guide](https://www.npmjs.com/get-npm)
  - [yarn installation guide](https://classic.yarnpkg.com/en/docs/install)
- git installed
  - [Installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- AWS Cli installed
  - [Installation guide](https://aws.amazon.com/cli/)
- access key ID and secret access key of an AWS IAM user with proper permissions
  - [User guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)



**Usage:**

1. Clone this repo

   ```bash
   git clone https://github.com/lhmcn/serverless-typescript-starter.git projectName
   ```

2. Install dependencies

   ```bash
   cd projectName
   npm install
   ```

3. Test the demo functions

   ```bash
   serverless offline
   ```

   Move to next step if it works with no error.

4. Write your code.

   - A tutorial for beginners can be found on [Serverless Stack](https://serverless-stack.com/) (ES6 only)

5. Deploy to AWS

   ```bash
   serverless deploy -v
   ```

   - You may be asked to enter your access key ID and secret access key.