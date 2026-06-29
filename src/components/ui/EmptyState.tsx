import { PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-line bg-bg-soft/50 px-6 py-16 text-center">
      <div className="rounded-full bg-bg p-3 text-ink-mute">{icon ?? <PackageOpen className="h-6 w-6" />}</div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-mute">{description}</p>}
      {action}
    </div>
  );
}
