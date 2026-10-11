"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import Button from "@/components/ui/button";

export default function GuestQr({ slug }) {
  const [dataUrl, setDataUrl] = useState(""); const [url, setUrl] = useState("");
  useEffect(() => {
    const address = `${window.location.origin}/s/${slug}`;
    QRCode.toDataURL(address, { width: 320, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } }).then((data) => { setUrl(address); setDataUrl(data); });
  }, [slug]);
  return <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start"><div className="flex h-56 w-56 items-center justify-center rounded-xl border border-slate-100 bg-white p-3">{dataUrl && <Image src={dataUrl} alt="QR code for the public shop catalog" width={320} height={320} unoptimized className="h-full w-full" />}</div><div className="space-y-3 text-sm"><p>Print this QR code or display it at the counter. Customers can scan it to view products and prices and leave feedback.</p>{url && <a className="block break-all text-blue-900 underline" href={url} target="_blank" rel="noreferrer">Open public catalog</a>}<a href={dataUrl || undefined} download={`${slug}-catalog-qr.png`}><Button type="button" variant="secondary" disabled={!dataUrl}>Download QR code</Button></a></div></div>;
}
