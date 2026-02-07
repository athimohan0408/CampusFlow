"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

interface QRCodeGeneratorProps {
    data: string;
}

export default function QRCodeGenerator({ data }: QRCodeGeneratorProps) {
    const [src, setSrc] = useState<string>("");

    useEffect(() => {
        QRCode.toDataURL(data, { width: 200, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
            .then(setSrc);
    }, [data]);

    if (!src) return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />;

    return (
        <div className="bg-white p-4 rounded-xl shadow-inner">
            <img src={src} alt="QR Code" className="w-full h-full" />
        </div>
    );
}
