import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

console.log("running instrumentation");

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
export const spanProcessor = new SimpleSpanProcessor(new OTLPTraceExporter());

export const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "example-nextjs-app",
  }),
  spanProcessor,
  instrumentations: [new HttpInstrumentation()],
});
