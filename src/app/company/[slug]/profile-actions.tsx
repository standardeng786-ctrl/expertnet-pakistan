"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/track";

interface Props {
  companyId: string;
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  waMessage: string;
}

export default function ProfileActions({ companyId, whatsappNumber, phone, email, website, waMessage }: Props) {
  useEffect(() => {
    trackEvent("profile_view", { entity_type: "company", entity_id: companyId });
  }, [companyId]);

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace("+", "")}?text=${waMessage}`}
          target="_blank"
          onClick={() => trackEvent("whatsapp_click", { entity_type: "company", entity_id: companyId })}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={() => trackEvent("call_click", { entity_type: "company", entity_id: companyId })}
          className="border border-navy px-4 py-2 rounded-md text-sm font-semibold"
        >
          Call
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="border border-navy px-4 py-2 rounded-md text-sm font-semibold">
          Email
        </a>
      )}
      {website && (
        <a href={website} target="_blank" className="border border-navy px-4 py-2 rounded-md text-sm font-semibold">
          Website
        </a>
      )}
      <a href={`/requirements/new?company=${companyId}`} className="bg-gold text-white px-4 py-2 rounded-md text-sm font-semibold">
        Request Quotation
      </a>
    </div>
  );
}
