-- The site repository remains available through RepositoryProfile for homepage page 6,
-- but it is intentionally not a Resource and must not appear in the campus-project wall.
DELETE FROM "Resource"
WHERE lower(rtrim("url", '/')) = lower('https://github.com/woodfishhhh/jufe-offer');
