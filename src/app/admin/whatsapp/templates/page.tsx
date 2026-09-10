import { createServerSupabase } from "@/lib/supabase/server";

export default async function TemplatesPage() {
  const supabase = createServerSupabase();
  const { data: templates } = await supabase.from("whatsapp_templates").select("*").order("meta_template_name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">Templates</h1>
      <p className="text-sm text-gray-500 mb-6">
        Mirrors templates approved in the Meta WhatsApp Business Manager. Create/edit templates there first,
        then register the approved name here so campaigns can reference it.
      </p>
      <div className="space-y-3">
        {(templates ?? []).map((t) => (
          <div key={t.id} className="border rounded-md p-4">
            <p className="font-semibold">{t.meta_template_name}</p>
            <p className="text-xs text-gray-500">{t.category} · {t.language} · {t.status}</p>
            <p className="text-sm mt-2">{t.body}</p>
          </div>
        ))}
        {(!templates || templates.length === 0) && <p className="text-sm text-gray-500">No templates registered yet.</p>}
      </div>
    </div>
  );
}
