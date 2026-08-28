CREATE TABLE "SiteMetric" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "SiteMetric" ("key", "value", "updatedAt")
VALUES ('visitor-count', 675, CURRENT_TIMESTAMP);
