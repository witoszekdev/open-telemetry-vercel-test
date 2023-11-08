import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

console.log("running instrumentation");
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "example-nextjs-app",
  }),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: "https://otel.plur.tech/v1/traces",
    }),
  ),
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();
