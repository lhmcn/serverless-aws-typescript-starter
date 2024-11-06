# AWS Serverless Starter Kit for TypeScript

This is a pre-configured starter kit for AWS serverless developers.

**Language:** TypeScript

**Pre-configured AWS Services:**

- DynamoDB

- Cognito User Pool

- Cognito Identity Pool

- S3 bucket for attachment

- SNS

**Pre-requisitions:**

- npm or yarn installed
    - [npm installation guide](https://www.npmjs.com/get-npm)
    - [yarn installation guide](https://classic.yarnpkg.com/en/docs/install)
- git installed
    - [Installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- AWS Cli installed
    - [Installation guide](https://aws.amazon.com/cli/)

**Usage:**

1. Clone this repo

   ```
   git clone https://github.com/lhmcn/serverless-aws-typescript-starter.git projectName
   ```

2. Install dependencies

   ```
   cd projectName
   npm install
   ```
3. Edit serverless.yml and change your-app-name

4. Write your code.

5. Deploy to AWS
   ```
   serverless deploy --verbose
   ```
    - You may be asked to enter your access key ID and secret access key.
    - Copy and save the "Stack Outputs" section in a text file, these values will be required by the front end.

6. Change Role settings in AWS console
    - Sign in to AWS console and navigate to Cognito > Identity pools
    - Click "{your-app-name}-identity-pool-{your-stage}" in the identity pool list
    - Click the "User access" tab
    - Scroll down to the "Identity providers" section
    - Click each provider, edit role settings, and change "Role selection" to "Choose role with preferred_role claim in tokens"

7. Create your root user in Cognito > User pools if needed