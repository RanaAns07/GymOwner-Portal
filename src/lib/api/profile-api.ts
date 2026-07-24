/**
 * Current user profile API
 *
 * GET   /api/v1/users/profiles/me/
 * PATCH /api/v1/users/profiles/me/  (JSON or multipart for profile.profile_image)
 */

import { apiClient } from '@/lib/api';

export interface MeProfile {
    nickname?: string;
    bio?: string;
    phone_number?: string;
    profile_image?: string | null;
}

export interface MeUser {
    id: string;
    email: string;
    role?: string;
    nickname?: string;
    tenant_id?: string;
    tenant_name?: string;
    tenant_subdomain?: string;
    profile?: MeProfile;
}

/** GET /users/profiles/me/ */
export async function fetchMyProfileApi(): Promise<MeUser> {
    const data = await apiClient.get<MeUser>('/users/profiles/me/');
    console.log('[GET /users/profiles/me/]', data);
    console.log(
        '[GET /users/profiles/me/] profile_image URL:',
        data.profile?.profile_image
    );
    return data;
}

/**
 * PATCH /users/profiles/me/
 * Supports multipart for image: profile.nickname, profile.profile_image
 */
export async function updateMyProfileApi(input: {
    nickname?: string;
    bio?: string;
    phone_number?: string;
    imageFile?: File | null;
}): Promise<MeUser> {
    const hasImage = !!input.imageFile;

    if (hasImage) {
        const formData = new FormData();
        if (input.nickname !== undefined) {
            formData.append('profile.nickname', input.nickname);
        }
        if (input.bio !== undefined) {
            formData.append('profile.bio', input.bio);
        }
        if (input.phone_number !== undefined) {
            formData.append('profile.phone_number', input.phone_number);
        }
        formData.append(
            'profile.profile_image',
            input.imageFile as File,
            (input.imageFile as File).name || 'avatar.jpg'
        );
        return apiClient.patchFormData<MeUser>('/users/profiles/me/', formData);
    }

    return apiClient.patch<MeUser>('/users/profiles/me/', {
        profile: {
            ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
            ...(input.bio !== undefined ? { bio: input.bio } : {}),
            ...(input.phone_number !== undefined
                ? { phone_number: input.phone_number }
                : {}),
        },
    });
}
