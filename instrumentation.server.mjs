import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://4f3a1762974e77da7b1e347738080185@o4506538845929472.ingest.us.sentry.io/4506538846126080",
    tracesSampleRate: 1,
    autoInstrumentRemix: true
})