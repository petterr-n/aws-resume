# resume-app

## Resume available at: https://petter-rn.no

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI. It includes the following files and folders.

- src/visitor_counter/app.py - Code for the application's Lambda function.
- tests - Unit tests for the application code. 
- template.yaml - A template that defines the application's AWS resources.
- website/* - React-frontend code for the resume.

Github actions is used for CI/CD deployment and makes it so changes are automatically applied to the AWS cloud services and the React frontend is automatically built and hosted. 

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. 

