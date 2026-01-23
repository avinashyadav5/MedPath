import Image from "next/image";
import { cn } from "@/lib/utils";
export function Logo({ className, width = 32, height = 32 }) {
    return (<div className={cn("relative flex items-center justify-center overflow-hidden rounded-lg", className)}>
        <Image src="/logo.png" alt="MedPath Logo" width={width} height={height} className="object-contain" priority />
    </div>);
}
