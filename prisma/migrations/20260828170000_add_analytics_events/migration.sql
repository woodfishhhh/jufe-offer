CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "referrerHost" TEXT,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "language" TEXT,
    "timezone" TEXT,
    "metricName" TEXT,
    "metricValue" REAL,
    "metricRating" TEXT,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AnalyticsEvent_createdAt_eventType_idx"
ON "AnalyticsEvent"("createdAt", "eventType");

CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx"
ON "AnalyticsEvent"("sessionId", "createdAt");

CREATE INDEX "AnalyticsEvent_path_eventType_idx"
ON "AnalyticsEvent"("path", "eventType");

CREATE INDEX "AnalyticsEvent_visitorId_createdAt_idx"
ON "AnalyticsEvent"("visitorId", "createdAt");
