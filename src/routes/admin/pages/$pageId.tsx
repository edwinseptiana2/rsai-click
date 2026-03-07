import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/pages/$pageId")({
  component: RouteComponent,
});

import { MicrositeEditor } from "@/components/microsite/microsite-editor";

function RouteComponent() {
  const { pageId } = Route.useParams();
  const id = parseInt(pageId);

  if (isNaN(id)) return <div>Invalid Page ID</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 display-title">
          Microsite Editor
        </h1>
      </div>

      <MicrositeEditor pageId={id} />
    </div>
  );
}
