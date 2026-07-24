'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toDisplayImageUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
    src?: string | null;
    alt?: string;
    fallback: string;
    className?: string;
    fallbackClassName?: string;
}

/**
 * Avatar that falls back to initials when the remote media URL 404s.
 * Logs the failing URL so we can tell API-has-string vs file-not-served apart.
 */
export function ProfileAvatar({
    src,
    alt,
    fallback,
    className,
    fallbackClassName,
}: ProfileAvatarProps) {
    const resolved = toDisplayImageUrl(src);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [resolved]);

    return (
        <Avatar className={className}>
            {resolved && !failed ? (
                <AvatarImage
                    key={resolved}
                    src={resolved}
                    alt={alt}
                    referrerPolicy="no-referrer"
                    onError={() => {
                        console.warn(
                            '[ProfileAvatar] image failed to load (URL from API is not reachable):',
                            src,
                            '→ tried:',
                            resolved
                        );
                        setFailed(true);
                    }}
                />
            ) : null}
            <AvatarFallback className={cn(fallbackClassName)}>{fallback}</AvatarFallback>
        </Avatar>
    );
}
