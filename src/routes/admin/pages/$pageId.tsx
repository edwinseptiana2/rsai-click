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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Microsite Editor</h1>
          <p className="text-muted-foreground">Edit your microsite</p>
        </div>
      </div>

      <MicrositeEditor pageId={id} />
    </div>
  );
}
