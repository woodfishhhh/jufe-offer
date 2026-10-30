ALTER TABLE "AnalyticsEvent" ADD COLUMN "eventId" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "viewport" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "effectsMode" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "revision" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "navigationType" TEXT;

CREATE UNIQUE INDEX "AnalyticsEvent_visitorId_eventId_key"
ON "AnalyticsEvent"("visitorId", "eventId");

CREATE INDEX "AnalyticsEvent_metricName_path_viewport_effectsMode_revision_idx"
ON "AnalyticsEvent"("metricName", "path", "viewport", "effectsMode", "revision");
