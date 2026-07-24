/**
 * Session cache for staff avatars after upload.
 * Backend often returns a profile_image URL that is not publicly served (404),
 * so we keep a data-URL fallback until media hosting works.
 */

const PREFIX = 'staff_avatar:';

export function setStaffAvatarCache(staffId: string, dataUrl: string): void {
    if (typeof window === 'undefined' || !staffId || !dataUrl) return;
    try {
        sessionStorage.setItem(`${PREFIX}${staffId}`, dataUrl);
    } catch {
        // quota / private mode — ignore
    }
}

export function getStaffAvatarCache(staffId: string): string | undefined {
    if (typeof window === 'undefined' || !staffId) return undefined;
    try {
        return sessionStorage.getItem(`${PREFIX}${staffId}`) || undefined;
    } catch {
        return undefined;
    }
}

export function resolveStaffAvatar(
    staffId: string,
    remote?: string | null
): string | undefined {
    return getStaffAvatarCache(staffId) || remote || undefined;
}

export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
