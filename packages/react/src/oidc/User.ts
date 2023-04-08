import { useEffect, useState } from 'react';

import { OidcUserInfo, VanillaOidc } from './vanilla/vanillaOidc.js';

export enum OidcUserStatus {
    Unauthenticated= 'Unauthenticated',
    Loading = 'Loading user',
    Loaded = 'User loaded',
    LoadingError = 'Error loading user'
}

export type OidcUser<T extends OidcUserInfo = OidcUserInfo> = {
    user?: T;
    status: OidcUserStatus;
}

export type OidcUserManager<T extends OidcUserInfo = OidcUserInfo> = {
    oidcUser: T;
    oidcUserLoadingState: OidcUserStatus;
    refresh: () => void;
}


export const useOidcUser = <T extends OidcUserInfo = OidcUserInfo>(configurationName = 'default') => {
    const [oidcUser, setOidcUser] = useState<OidcUser<T>>({ status: OidcUserStatus.Unauthenticated });
    const [isRefresh, setIsRefresh] = useState<boolean>(false);

    const oidc = VanillaOidc.get(configurationName);

    useEffect(() => {
        let isFirst = isRefresh === false && oidcUser.user === undefined;
        if (oidc && oidc.tokens && (isFirst || isRefresh)) {
            
            setOidcUser(current => ({ ...current, status: OidcUserStatus.Loading }));
            oidc.userInfoAsync<T>(isRefresh)
            .then((info) => {
                setOidcUser({ user: info, status: OidcUserStatus.Loaded });
            })
            .catch(() => setOidcUser(current => ({ ...current, status: OidcUserStatus.LoadingError })))
            .finally(() => setIsRefresh(false));

            
        }
    }, [isRefresh, oidc, oidcUser]);

    const refresh = () => {
        if (!isRefresh && oidcUser.status === OidcUserStatus.Loaded) {
            setIsRefresh(true);
        }
    };


    return { oidcUser: oidcUser.user!, oidcUserLoadingState: oidcUser.status, refresh } as OidcUserManager<T>;
};
