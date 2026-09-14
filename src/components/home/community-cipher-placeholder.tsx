import styles from "./community-cipher-placeholder.module.css";

const CIPHER_LINE = "01 / JUFE # 7X + 0F : A9 * 26 <> 8B = 10 / ";

/** A deterministic, server-rendered cover while the interactive cipher warms up. */
export function CommunityCipherPlaceholder() {
  return (
    <div className={styles.cover} aria-hidden="true" data-community-cipher-placeholder>
      <noscript>
        <style>{`[data-community-cipher-placeholder] { display: none !important; }
          .community-stage__decrypt > .community-pass,
          .community-stage__decrypt > .community-qr-card { opacity: 1 !important; }`}</style>
      </noscript>
      <div className={styles.glyphs}>
        {Array.from({ length: 32 }, (_, index) => (
          <div key={index}>{CIPHER_LINE.repeat(5).slice(index % 17)}</div>
        ))}
      </div>
    </div>
  );
}
