import { createServerSupabase } from "@/lib/supabase/server";
import ReplyForm from "./reply-form";

export default async function InboxPage({ searchParams }: { searchParams: { c?: string } }) {
  const supabase = createServerSupabase();

  const { data: conversations } = await supabase
    .from("whatsapp_conversations")
    .select("id, contact_id, status, last_message_at, whatsapp_contacts(display_name, phone_e164, consent_status)")
    .order("last_message_at", { ascending: false })
    .limit(50);

  const activeId = searchParams.c ?? conversations?.[0]?.id;
  const activeConversation = conversations?.find((c: any) => c.id === activeId);

  const { data: messages } = activeId
    ? await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("sent_at", { ascending: true })
    : { data: [] };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Inbox</h1>
      <div className="flex border rounded-md overflow-hidden" style={{ minHeight: 420 }}>
        <div className="w-64 border-r overflow-y-auto">
          {(conversations ?? []).map((c: any) => (
            <a
              key={c.id}
              href={`/admin/whatsapp/inbox?c=${c.id}`}
              className={`block px-4 py-3 border-b text-sm hover:bg-gray-50 ${c.id === activeId ? "bg-gray-100" : ""}`}
            >
              <p className="font-semibold">{c.whatsapp_contacts?.display_name || c.whatsapp_contacts?.phone_e164}</p>
              <p className="text-xs text-gray-500">{c.whatsapp_contacts?.consent_status}</p>
            </a>
          ))}
          {(!conversations || conversations.length === 0) && (
            <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
          )}
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {(messages ?? []).map((m: any) => (
            <div key={m.id} className={`max-w-sm ${m.direction === "outbound" ? "ml-auto text-right" : ""}`}>
              <div
                className={`inline-block px-3 py-2 rounded-md text-sm ${
                  m.direction === "outbound" ? "bg-navy text-white" : "bg-gray-100"
                }`}
              >
                {m.body}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{m.status}</p>
            </div>
          ))}
          {activeConversation && <ReplyForm contactId={activeConversation.contact_id} />}
        </div>
      </div>
    </div>
  );
}
