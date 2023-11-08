import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
export const spanProcessor = new SimpleSpanProcessor(new OTLPTraceExporter());

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "example-nextjs-app",
  }),
  spanProcessor: spanProcessor,
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();
