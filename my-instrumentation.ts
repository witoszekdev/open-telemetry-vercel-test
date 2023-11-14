import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { spanProcessor } from "./utils";

console.log("running instrumentation");

// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

export const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "example-nextjs-app",
  }),
  spanProcessor,
  instrumentations: [new HttpInstrumentation()],
});
