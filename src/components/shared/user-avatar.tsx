import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ src, name, className, fallbackClassName }: UserAvatarProps) {
  const parts = name.split(" ");
  return (
    <Avatar className={cn("size-9", className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className={cn("bg-primary/10 text-primary text-xs font-semibold", fallbackClassName)}>
        {initials(parts[0] ?? "", parts[1])}
      </AvatarFallback>
    </Avatar>
  );
}
