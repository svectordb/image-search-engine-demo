import { Context } from "aws-lambda";
import pino from "pino";

export function getLogger(context: Context) {
    return pino({ base: {
        awsRequestId: context.awsRequestId,
    }, serializers: { err: pino.stdSerializers.err }});
}

export function requireEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}