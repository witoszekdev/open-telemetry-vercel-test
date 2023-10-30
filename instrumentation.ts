import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { env } from "./lib/env.mjs";

export function register() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "example-nextjs-app",
    }),
    spanProcessor: new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: env.NEXT_PUBLIC_OTEL_URL,
      }),
    ),
  });

  sdk.start();
}
