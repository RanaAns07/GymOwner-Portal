'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/auth-context';
import { fetchMyProfileApi, updateMyProfileApi } from '@/lib/api/profile-api';
import type { ApiUser } from '@/types/api-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Loader2, Mail, User } from 'lucide-react';
import { toDisplayImageUrl } from '@/lib/media-url';
import { PageReveal } from '@/components/dashboard/PageReveal';

export default function ProfileSettingsPage() {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);

    // Load once on mount — do not re-fetch when auth user updates after save
    // (that was clearing the local preview and flashing the form).
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const me = await fetchMyProfileApi();
                if (cancelled) return;
                const name = me.profile?.nickname || me.nickname || '';
                setNickname(name);
                setEmail(me.email || '');
                const remote = me.profile?.profile_image || null;
                const local = user?.profile?.profile_image || null;
                // Prefer session data-URL when backend media URL is not reachable
                setImageUrl(
                    local && local.startsWith('data:') ? local : remote || local
                );
                setImgFailed(false);
            } catch {
                if (cancelled) return;
                setNickname(user?.nickname || user?.profile?.nickname || '');
                setEmail(user?.email || '');
                setImageUrl(user?.profile?.profile_image || null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const initials = nickname
        ? nickname.substring(0, 2).toUpperCase()
        : email.substring(0, 2).toUpperCase() || 'U';

    const displaySrc =
        previewUrl || toDisplayImageUrl(imageUrl, { cacheBust: true });

    const onPickImage = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file.');
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setImgFailed(false);
    };

    const handleRemoteError = useCallback(() => {
        // Keep local preview if we have one; otherwise show initials
        if (!previewUrl) setImgFailed(true);
    }, [previewUrl]);

    const handleSave = async () => {
        const trimmed = nickname.trim();
        if (trimmed.length < 2) {
            toast.error('Name must be at least 2 characters.');
            return;
        }

        setSaving(true);
        try {
            const updated = await updateMyProfileApi({
                nickname: trimmed,
                imageFile,
            });

            const nextName = updated.profile?.nickname || updated.nickname || trimmed;
            const remoteImage = updated.profile?.profile_image || null;

            // Prefer a data URL for session display — backend media URLs currently 404
            // when nginx is not serving /profile_images/.
            let sessionImage = remoteImage || imageUrl;
            if (imageFile) {
                sessionImage = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(imageFile);
                });
            }

            const merged: ApiUser = {
                ...(user as ApiUser),
                id: updated.id || user?.id || '',
                email: updated.email || user?.email || '',
                role: (updated.role as ApiUser['role']) || user?.role || 'gym_owner',
                nickname: nextName,
                profile: {
                    ...user?.profile,
                    ...updated.profile,
                    nickname: nextName,
                    profile_image: sessionImage,
                },
            };

            updateUser(merged);
            setNickname(nextName);
            setImageUrl(sessionImage);
            setImageFile(null);
            setImgFailed(false);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            toast.success('Profile updated.');
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to update profile';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageReveal className="space-y-6 max-w-xl">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                    Profile Settings
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                    Update your display name and profile photo. Email cannot be changed here.
                </p>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4 text-accent-foreground" />
                        Your profile
                    </CardTitle>
                    <CardDescription>
                        This is how you appear in the owner portal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-ink-muted">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading profile…
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 ring-2 ring-border">
                                        {displaySrc && !imgFailed ? (
                                            <AvatarImage
                                                key={displaySrc}
                                                src={displaySrc}
                                                alt={nickname || 'Profile'}
                                                referrerPolicy="no-referrer"
                                                onError={handleRemoteError}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-ink text-lg font-medium text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800"
                                        aria-label="Change photo"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            onPickImage(e.target.files?.[0] || null)
                                        }
                                    />
                                </div>
                                <div className="text-sm text-ink-muted">
                                    <p className="font-medium text-zinc-800">Profile photo</p>
                                    <p className="mt-0.5">JPG or PNG. Optional.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nickname">Display name</Label>
                                <Input
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                                    <Input
                                        id="email"
                                        value={email}
                                        readOnly
                                        disabled
                                        className="bg-canvas pl-9"
                                    />
                                </div>
                                <p className="text-xs text-ink-muted">
                                    Email and password cannot be edited here.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}

                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        'Save changes'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </PageReveal>
    );
}
