import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export const spanProcessor = new SimpleSpanProcessor(
  new OTLPTraceExporter({
    url: "https://otel.plur.tech/v1/traces",
  }),
);
