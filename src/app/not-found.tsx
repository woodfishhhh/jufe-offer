import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1200px] flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-muted-foreground font-mono text-sm">404</p>
      <h1 className="font-display mt-3 text-[42px] font-bold tracking-[-0.03em]">
        页面不存在
      </h1>
      <div className="mt-8">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          返回首页
        </Link>
      </div>
    </div>
  );
}
