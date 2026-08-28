import { QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { ResilientImage } from "@/components/resilient-image";
import { Card } from "@/components/ui/card";
import { site } from "@/data/site";

export function CommunityPassShell({ actions }: { actions: ReactNode }) {
  return (
    <Card className="community-pass">
      <div className="community-pass__grid" aria-hidden="true" />
      <span className="community-pass__number" aria-hidden="true">
        02
      </span>
      <div className="community-pass__content">
        <div className="community-pass__brand">
          <span className="community-pass__logo">
            <ResilientImage
              src={site.logoSrc}
              alt=""
              width={60}
              height={60}
              sizes="30px"
            />
          </span>
          <span>JUFE OFFER</span>
          <span className="community-pass__brand-rule" />
          <span>ACCESS / 729</span>
        </div>
        <div className="community-pass__body">
          <div className="community-pass__copy">
            <p>{site.qqGroupPurpose}</p>
            <h2>
              <span>{site.communityCardTitle}</span>
            </h2>
          </div>

          <div className="community-pass__qr">
            <div className="community-pass__qr-header">
              <QrCode />
              <span>QQ GROUP</span>
              <span>SCAN / 02</span>
            </div>
            <div className="community-pass__qr-image">
              <ResilientImage
                src={site.qqGroupQrSrc}
                alt={`${site.qqGroupName}群二维码`}
                width={400}
                height={400}
                loading="eager"
                sizes="(max-width: 480px) 176px, (max-width: 1023px) 232px, 248px"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="community-pass__actions-layer">{actions}</div>
    </Card>
  );
}

export function CommunityFloatingQrCard() {
  return (
    <Card className="community-qr-card">
      <div className="community-qr-card__header">
        <QrCode />
        <span>QQ GROUP</span>
        <span>SCAN / 02</span>
      </div>
      <div className="community-qr-card__image">
        <ResilientImage
          src={site.qqGroupQrSrc}
          alt={`${site.qqGroupName}群二维码`}
          width={400}
          height={400}
          loading="eager"
          sizes="248px"
          className="h-auto w-full"
        />
      </div>
    </Card>
  );
}
