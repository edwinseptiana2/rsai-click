import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/pages/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/pages/new"!</div>
}
