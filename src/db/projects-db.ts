import { BillingMode, CreateTableCommand, DescribeTableCommand, DynamoDBClient, QueryCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { Project } from "../types/types";
import { configDotenv } from "dotenv";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
configDotenv();

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const tableName = "projects-ddb"

const createTableCommand = new CreateTableCommand({
        TableName: tableName,
        BillingMode: BillingMode.PAY_PER_REQUEST,
        KeySchema: [
          { AttributeName: "id", KeyType: "HASH" }
        ],
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" }
        ]
});

export class projectDB {
    constructor() {
        this.initDB().then(() => {
            console.log("Database initialized.");
        }).catch((err) => {
            console.error("Error initializing database: ", err);
        });
    }
    initDB = async () => {
        try {
            // Check if table exists
            const describeCommand = new DescribeTableCommand({
                TableName: tableName
            });
            await client.send(describeCommand);
            console.log("Table already exists.");
            return;
        } catch (error: any) {
            // ResourceNotFoundException means table doesn't exist
            if (error.name === "ResourceNotFoundException") {
                console.log("Creating a table.");
                const createTableResponse = await client.send(createTableCommand);
                console.log(`Table created: ${JSON.stringify(createTableResponse.TableDescription)}`);
                console.log("Waiting for the table to be active.");
                await waitUntilTableExists({
                    client,
                    maxWaitTime: 60
                }, {TableName: tableName });
                console.log("Table active.");
            } else {
                throw error;
            }
        }
    }
    getAll = async () => {
        const getCommand = new ScanCommand({
            TableName: tableName,
            Limit: 10
        });
        const getResponses = await ddb.send(getCommand)
        console.log(`Got the project: ${JSON.stringify(getResponses.Items)}`);
        return getResponses.Items as unknown as Project[];
    };
    get = async (projectId: number) => {
        const getCommand = new GetCommand({
            TableName: tableName,
            Key: {projectId},
            ConsistentRead: true,
        });
        const getResponse = await ddb.send(getCommand)
        console.log(`Got the project: ${JSON.stringify(getResponse.Item)}`);
        return getResponse.Item as Project;
    };
    create = async (project: Project) => {
        console.log("Creating a single project in the table.");
        const updateCommand = new PutCommand({
          TableName: tableName,
          Item: project,
          ReturnValues: "ALL_OLD",
        });
        await ddb.send(updateCommand);
        console.log(`Project created: ${JSON.stringify(project)}`);
        return project as Project;
    };
    delete = async (projectId: string) => {
        console.log(projectId)
        const deleteCommand = new DeleteCommand({
            TableName: tableName,
            Key: {id: projectId}
        });
        const deleteResponse = await ddb.send(deleteCommand)
        console.log(`Deleted the project.`);
        return;
    };
}