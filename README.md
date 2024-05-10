# Image Search Engine Demo

This is a simple image search engine demo using OpenAI's CLIP, SvectorDB and the Unsplash lite dataset. The dataset contains 25,000 images which is embedded using CLIP and stored in SvectorDB. The search engine uses the CLIP embeddings to find related images.

View the demo [here](https://demo.svectordb.com/?utm_source=github&utm_medium=referral&utm_campaign=demo-image-search).

## Installation

### Prerequisites 

1. Sign up for an account on [SvectorDB](https://svectordb.com/).
2. Activate the SvectorDB CloudFormation extensions in your AWS account, following this guide https://www.svectordb.com/docs/Integrations/CloudFormation/getting-started
3. Create a new database on SvectorDB with 512 dimensions and metric type as `cosine`.

### Loading the data

You can embed the data using SvectorDB's embedding API or use the pre-embedded data. For this tutorial, we will use the pre-embedded data to save downloading all the images.

1. Go to the `load` directory
2. Run `npm i` and if you don't have tsx installed, run `npm i -g tsx`
3. Create an API key in the SvectorDB console, and then run `DATABASE_ID=YOUR_DATABASE_ID API_KEY=YOUR_API_KEY tsx src/index-embedded.ts`

Your data should now be loaded into SvectorDB.

### Deploying the infrastructure

1. Go to the `server` directory
2. Run `npm i` and `npm run build`. This will produce a new zip file in the `dist` directory.
3. Upload this zip file to an S3 bucket in your AWS account.
4. Create a new CloudFormation stack using the `/cloudformation.yaml` template. You will need to provide the S3 URL of the zip file as a parameter.

### Deploying the frontend

1. Go to the `web` directory
2. Run `npm i` and `npm run build`. This will produce a new build in the `build` directory.
3. Upload the contents of the `build` directory to the CloudFront origin S3 bucket created by the CloudFormation stack