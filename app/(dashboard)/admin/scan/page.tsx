"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QRScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        async function onScanSuccess(decodedText: string, decodedResult: any) {
            // To prevent multiple scans of same frame
            scanner.pause();

            try {
                const data = JSON.parse(decodedText);

                // Call API
                const res = await fetch('/api/events/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message || "Scan failed");
                }
                setScanResult(result.message);

            } catch (e) {
                console.error("Scan error", e);
                toast.error("Invalid QR Code format");
            } finally {
                // Resume scanning after delay
                setTimeout(() => {
                    scanner.resume();
                }, 2000);
            }
        }

        function onScanFailure(error: any) {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.warn(`Code scan error = ${error}`);
        }

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            });
        };
    }, []);

    return (
        <div className="max-w-md mx-auto space-y-6">
            <Button asChild variant="ghost" className="pl-0">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Scan Attendance</CardTitle>
                    <CardDescription>Point camera at student&apos;s event ticket QR code.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div id="reader" className="w-full overflow-hidden rounded-lg bg-black"></div>
                    {scanResult && (
                        <div className="mt-4 p-4 bg-muted rounded-md text-center font-medium">
                            Last Scan: {scanResult}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
