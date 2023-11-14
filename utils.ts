import {
  BatchSpanProcessor,
  SpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { Span, Context } from "@opentelemetry/api";
import { ReadableSpan } from "@opentelemetry/sdk-trace-base";
// import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

// Debug span processor
export class CustomBatchSpanProcessor extends BatchSpanProcessor {
  onEnd(span: ReadableSpan): void {
    if (span.instrumentationLibrary.name === "next.js") {
      console.log("Dropping next.js spans");
    } else {
      super.onEnd(span);
    }
  }
}

export class CustomBatchSpanProcessorBis implements SpanProcessor {
  public finishedSpans: ReadableSpan[] = [];

  async forceFlush(): Promise<void> {
    console.log("Force flush");
    if (this.finishedSpans.length > 0) {
      console.log(`Flushing ${this.finishedSpans.length} spans`);
    }
  }

  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(span: ReadableSpan): void {
    if (span.instrumentationLibrary.name === "next.js") {
      console.log("Dropping next.js spans");
    } else {
      this.finishedSpans.push(span);
    }
  }

  async shutdown(): Promise<void> {
    console.log("Shutdown");
  }
}

export const spanProcessor = new CustomBatchSpanProcessorBis();
// export const spanProcessor = new SimpleSpanProcessor(
//   new OTLPTraceExporter({
//     url: "https://otel.plur.tech/v1/traces",
//   }),
// );
