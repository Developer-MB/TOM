import usersDictionary from '../../data/post-users.json';

export type CmsUserRole =
    | 'SUPERADMIN'
    | 'ADMIN'
    | 'EDITOR'
    | 'MODERADOR'
    | 'COLABORADOR';

export type CmsSectionPermission =
    | 'RECOMENDACION'
    | 'GALERIA'
    | 'VIDEO'
    | 'TOUR'
    | 'RADIO'
    | 'MERCH'
    | 'CMS';

export const ALL_CONTENT_PERMISSIONS: CmsSectionPermission[] = [
    'RECOMENDACION',
    'GALERIA',
    'VIDEO',
    'TOUR',
    'RADIO',
    'MERCH',
];

export const ALL_SUPERADMIN_PERMISSIONS: CmsSectionPermission[] = [
    ...ALL_CONTENT_PERMISSIONS,
    'CMS',
];

export const CMS_PERMISSION_LABELS: Record<CmsSectionPermission, string> = {
    RECOMENDACION: 'Recomendaciones',
    GALERIA: 'Galería',
    VIDEO: 'Videos',
    TOUR: 'Giras',
    RADIO: 'Radio',
    MERCH: 'Merch',
    CMS: 'Control Total CMS y Usuarios',
};

export interface CmsRoleStyle {
    role: CmsUserRole;
    label: string;
    textClass: string;
    badgeClass: string;
    dotClass: string;
    description: string;
}

export const CMS_ROLE_STYLES: Record<CmsUserRole, CmsRoleStyle> = {
    SUPERADMIN: {
        role: 'SUPERADMIN',
        label: 'SUPERADMIN',
        textClass: 'text-[#EF4444]',
        badgeClass: 'border-[#DC2626]/70 bg-[#DC2626]/15 text-[#EF4444]',
        dotClass: 'bg-[#EF4444]',
        description: 'Acceso total a todas las secciones y único con administración de usuarios y del CMS.',
    },
    ADMIN: {
        role: 'ADMIN',
        label: 'ADMIN',
        textClass: 'text-amber-400',
        badgeClass: 'border-amber-500/60 bg-amber-950/50 text-amber-400',
        dotClass: 'bg-amber-400',
        description: 'Administrador operativo con permisos sobre las secciones asignadas.',
    },
    EDITOR: {
        role: 'EDITOR',
        label: 'EDITOR',
        textClass: 'text-emerald-400',
        badgeClass: 'border-emerald-500/60 bg-emerald-950/50 text-emerald-400',
        dotClass: 'bg-emerald-400',
        description: 'Editor de contenido en las secciones habilitadas.',
    },
    MODERADOR: {
        role: 'MODERADOR',
        label: 'MODERADOR',
        textClass: 'text-cyan-400',
        badgeClass: 'border-cyan-500/60 bg-cyan-950/50 text-cyan-400',
        dotClass: 'bg-cyan-400',
        description: 'Moderador de registros y programación en las secciones asignadas.',
    },
    COLABORADOR: {
        role: 'COLABORADOR',
        label: 'COLABORADOR',
        textClass: 'text-purple-400',
        badgeClass: 'border-purple-500/60 bg-purple-950/50 text-purple-400',
        dotClass: 'bg-purple-400',
        description: 'Colaborador con acceso restringido a secciones específicas.',
    },
};

export const getRoleStyle = (role: string): CmsRoleStyle => {
    const normalized = role?.toUpperCase() as CmsUserRole;
    return CMS_ROLE_STYLES[normalized] ?? CMS_ROLE_STYLES.EDITOR;
};

/**
 * Prefijo identificador de contraseñas codificadas con SHA-256 + Salt + Key Stretching:
 * Formato: tom$sha256$<salt_hex>$<digest_hex>
 */
const PASSWORD_HASH_PREFIX = 'tom$sha256$';
const PASSWORD_PEPPER = 'TOM-CMS-SECURITY-PEPPER-v1';
const HASH_ITERATIONS = 256;

const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (n: number, x: number): number => (x >>> n) | (x << (32 - n));

/**
 * Implementación síncrona estándar FIPS 180-4 SHA-256 en TypeScript puro.
 */
export const sha256Hex = (asciiInput: string): string => {
    const utf8 = new TextEncoder().encode(asciiInput);
    const bitLength = utf8.length * 8;

    const paddedLength = Math.ceil((utf8.length + 9) / 64) * 64;
    const buffer = new Uint8Array(paddedLength);
    buffer.set(utf8);
    buffer[utf8.length] = 0x80;

    const view = new DataView(buffer.buffer);
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
    view.setUint32(paddedLength - 4, bitLength >>> 0, false);

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const w = new Uint32Array(64);

    for (let offset = 0; offset < paddedLength; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
            const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let f = h5;
        let g = h6;
        let h = h7;

        for (let i = 0; i < 64; i++) {
            const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
            const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
        .map((word) => word.toString(16).padStart(8, '0'))
        .join('');
};

const generateRandomSaltHex = (byteLength = 8): string => {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const bytes = new Uint8Array(byteLength);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    return sha256Hex(`${Date.now()}-${Math.random()}`).slice(0, byteLength * 2);
};

/**
 * Verifica si una cadena ya se encuentra codificada bajo el esquema `tom$sha256$<salt>$<hash>`.
 */
export const isEncodedPassword = (value: string): boolean => {
    if (typeof value !== 'string' || !value.startsWith(PASSWORD_HASH_PREFIX)) {
        return false;
    }
    const parts = value.split('$');
    return parts.length === 4 && parts[2].length >= 8 && /^[0-9a-f]{64}$/i.test(parts[3]);
};

/**
 * Codifica una contraseña en texto plano aplicando Salt + Pepper + múltiples rondas de SHA-256.
 * Si la contraseña ya está codificada, la devuelve intacta.
 */
export const encodeCmsPassword = (plainOrEncoded: string, customSalt?: string): string => {
    if (isEncodedPassword(plainOrEncoded)) {
        return plainOrEncoded;
    }
    const salt = (customSalt ?? generateRandomSaltHex(8)).toLowerCase();
    let digest = sha256Hex(`${salt}:${plainOrEncoded}:${PASSWORD_PEPPER}`);
    for (let i = 1; i < HASH_ITERATIONS; i++) {
        digest = sha256Hex(`${digest}:${salt}:${plainOrEncoded}`);
    }
    return `${PASSWORD_HASH_PREFIX}${salt}$${digest}`;
};

/**
 * Comparación en tiempo constante para evitar ataques de temporización (timing attacks).
 */
const timingSafeEqualString = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
};

/**
 * Verifica una contraseña en texto plano contra el hash codificado almacenado en el diccionario.
 */
export const verifyCmsPassword = (plainInput: string, storedPassword: string): boolean => {
    if (!plainInput || !storedPassword) return false;
    if (isEncodedPassword(storedPassword)) {
        const parts = storedPassword.split('$');
        const salt = parts[2];
        const expectedHash = encodeCmsPassword(plainInput, salt);
        return timingSafeEqualString(expectedHash, storedPassword);
    }
    return timingSafeEqualString(plainInput, storedPassword);
};

export interface CmsUserAccount {
    username: string;
    password: string;
    displayName: string;
    role: CmsUserRole;
    permissions: CmsSectionPermission[];
}

export interface CmsAuthSession {
    username: string;
    displayName: string;
    role: CmsUserRole;
    permissions: CmsSectionPermission[];
}

const CMS_SESSION_STORAGE_KEY = 'tom_cms_auth_session';
const CMS_USERS_STORAGE_KEY = 'tom_cms_users_dictionary_v1';
export const CMS_USERS_UPDATED_EVENT = 'tom:cms-users-updated';

const normalizeUserAccount = (key: string, raw: Partial<CmsUserAccount>): CmsUserAccount => {
    const username = (raw.username || key).trim().toLowerCase();
    const role: CmsUserRole =
        raw.role && raw.role in CMS_ROLE_STYLES ? raw.role : 'EDITOR';

    const rawPermissions = Array.isArray(raw.permissions)
        ? raw.permissions.filter((perm): perm is CmsSectionPermission => perm in CMS_PERMISSION_LABELS)
        : [];

    const permissions: CmsSectionPermission[] =
        role === 'SUPERADMIN'
            ? [...ALL_SUPERADMIN_PERMISSIONS]
            : rawPermissions.filter((perm) => perm !== 'CMS');

    const rawPassword = typeof raw.password === 'string' && raw.password ? raw.password : '123456';
    const deterministicSalt = sha256Hex(`salt:${username}`).slice(0, 16);
    const encodedPassword = isEncodedPassword(rawPassword)
        ? rawPassword
        : encodeCmsPassword(rawPassword, deterministicSalt);

    return {
        username,
        password: encodedPassword,
        displayName: typeof raw.displayName === 'string' && raw.displayName.trim()
            ? raw.displayName.trim()
            : username,
        role,
        permissions: permissions.length > 0 ? permissions : ['RECOMENDACION'],
    };
};

const buildSeedDictionary = (): Record<string, CmsUserAccount> => {
    const rawDict = usersDictionary as Record<string, Partial<CmsUserAccount>>;
    const result: Record<string, CmsUserAccount> = {};
    for (const [key, value] of Object.entries(rawDict)) {
        const normalized = normalizeUserAccount(key, value);
        result[normalized.username] = normalized;
    }
    return result;
};

export const CMS_USERS_DICTIONARY: Record<string, CmsUserAccount> = buildSeedDictionary();

export const readUsersDictionary = (): Record<string, CmsUserAccount> => {
    const seed = buildSeedDictionary();
    if (typeof window === 'undefined') return seed;

    try {
        const storedRaw = window.localStorage.getItem(CMS_USERS_STORAGE_KEY);
        if (!storedRaw) return seed;

        const parsed = JSON.parse(storedRaw) as Record<string, Partial<CmsUserAccount>>;
        if (!parsed || typeof parsed !== 'object') return seed;

        const merged: Record<string, CmsUserAccount> = {};
        let migratedPlainPasswords = false;

        for (const [key, value] of Object.entries(parsed)) {
            if (value && typeof value === 'object') {
                if (typeof value.password === 'string' && !isEncodedPassword(value.password)) {
                    migratedPlainPasswords = true;
                }
                const account = normalizeUserAccount(key, value);
                merged[account.username] = account;
            }
        }

        const hasSuperAdmin = Object.values(merged).some((user) => user.role === 'SUPERADMIN');
        if (!hasSuperAdmin && seed.manro) {
            merged.manro = seed.manro;
        }

        const finalDict = Object.keys(merged).length > 0 ? merged : seed;
        if (migratedPlainPasswords) {
            window.localStorage.setItem(CMS_USERS_STORAGE_KEY, JSON.stringify(finalDict));
        }

        return finalDict;
    } catch {
        return seed;
    }
};

export const writeUsersDictionary = (dictionary: Record<string, CmsUserAccount>): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(CMS_USERS_STORAGE_KEY, JSON.stringify(dictionary));
        window.dispatchEvent(new CustomEvent(CMS_USERS_UPDATED_EVENT));
    } catch (error) {
        console.error('No se pudo guardar el diccionario de usuarios:', error);
    }
};

export const hasSectionPermission = (
    session: CmsAuthSession | null | undefined,
    permission: CmsSectionPermission,
): boolean => {
    if (!session) return false;
    if (session.role === 'SUPERADMIN') return true;
    if (permission === 'CMS') return false;
    return session.permissions.includes(permission);
};

export const authenticateCmsUser = (
    usernameInput: string,
    passwordInput: string,
): CmsAuthSession | null => {
    const normalizedUsername = usernameInput.trim().toLowerCase();
    const dictionary = readUsersDictionary();
    const account = dictionary[normalizedUsername];
    if (!account || !verifyCmsPassword(passwordInput, account.password)) {
        return null;
    }

    return {
        username: account.username,
        displayName: account.displayName,
        role: account.role,
        permissions: account.role === 'SUPERADMIN' ? [...ALL_SUPERADMIN_PERMISSIONS] : [...account.permissions],
    };
};

export const getStoredCmsSession = (): CmsAuthSession | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.sessionStorage.getItem(CMS_SESSION_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CmsAuthSession>;
        if (typeof parsed.username !== 'string') return null;

        const dictionary = readUsersDictionary();
        const normalizedUsername = parsed.username.trim().toLowerCase();
        const account = dictionary[normalizedUsername];
        if (!account) return null;

        return {
            username: account.username,
            displayName: account.displayName,
            role: account.role,
            permissions: account.role === 'SUPERADMIN'
                ? [...ALL_SUPERADMIN_PERMISSIONS]
                : [...account.permissions],
        };
    } catch {
        return null;
    }
};

export const saveCmsSession = (session: CmsAuthSession): void => {
    if (typeof window === 'undefined') return;
    try {
        window.sessionStorage.setItem(CMS_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('No se pudo guardar la sesión del CMS:', error);
    }
};

export const clearCmsSession = (): void => {
    if (typeof window === 'undefined') return;
    try {
        window.sessionStorage.removeItem(CMS_SESSION_STORAGE_KEY);
    } catch (error) {
        console.error('No se pudo limpiar la sesión del CMS:', error);
    }
};

export interface UpsertCmsUserInput {
    previousUsername?: string;
    username: string;
    /**
     * En creación es obligatoria. En edición puede enviarse vacía para conservar
     * la contraseña codificada actual del usuario sin modificarla.
     */
    password?: string;
    displayName: string;
    role: CmsUserRole;
    permissions: CmsSectionPermission[];
}

export const upsertCmsUser = (input: UpsertCmsUserInput): CmsUserAccount => {
    const dictionary = readUsersDictionary();
    const cleanUsername = input.username.trim().toLowerCase();
    const previousKey = input.previousUsername?.trim().toLowerCase();
    const existingAccount = previousKey ? dictionary[previousKey] : undefined;

    if (!cleanUsername) {
        throw new Error('El nombre de usuario es obligatorio.');
    }
    if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUsername)) {
        throw new Error('El usuario debe tener entre 3 y 30 caracteres (letras, números, guion o punto).');
    }

    const rawNewPassword = input.password?.trim() ?? '';
    let finalEncodedPassword: string;

    if (rawNewPassword) {
        if (!isEncodedPassword(rawNewPassword) && rawNewPassword.length < 4) {
            throw new Error('La contraseña debe tener al menos 4 caracteres.');
        }
        finalEncodedPassword = encodeCmsPassword(rawNewPassword);
    } else if (existingAccount) {
        finalEncodedPassword = encodeCmsPassword(existingAccount.password);
    } else {
        throw new Error('La contraseña es obligatoria para crear un nuevo usuario.');
    }

    if (previousKey && previousKey !== cleanUsername && dictionary[cleanUsername]) {
        throw new Error(`El nombre de usuario "${cleanUsername}" ya está registrado.`);
    }

    if (previousKey && dictionary[previousKey]?.role === 'SUPERADMIN' && input.role !== 'SUPERADMIN') {
        const superAdminCount = Object.values(dictionary).filter((u) => u.role === 'SUPERADMIN').length;
        if (superAdminCount <= 1) {
            throw new Error('No puedes quitar el rol SUPERADMIN al único Superadministrador del sistema.');
        }
    }

    const effectivePermissions: CmsSectionPermission[] =
        input.role === 'SUPERADMIN'
            ? [...ALL_SUPERADMIN_PERMISSIONS]
            : input.permissions.filter((perm) => perm !== 'CMS');

    if (input.role !== 'SUPERADMIN' && effectivePermissions.length === 0) {
        throw new Error('Selecciona al menos una sección de permiso para este usuario.');
    }

    const updatedAccount: CmsUserAccount = {
        username: cleanUsername,
        password: finalEncodedPassword,
        displayName: input.displayName.trim() || cleanUsername,
        role: input.role,
        permissions: effectivePermissions,
    };

    const nextDictionary = { ...dictionary };
    if (previousKey && previousKey !== cleanUsername) {
        delete nextDictionary[previousKey];
    }
    nextDictionary[cleanUsername] = updatedAccount;

    const currentSession = getStoredCmsSession();
    if (currentSession && (currentSession.username === previousKey || currentSession.username === cleanUsername)) {
        saveCmsSession({
            username: updatedAccount.username,
            displayName: updatedAccount.displayName,
            role: updatedAccount.role,
            permissions: updatedAccount.permissions,
        });
    }

    writeUsersDictionary(nextDictionary);
    return updatedAccount;
};

export const deleteCmsUser = (usernameToDelete: string): void => {
    const dictionary = readUsersDictionary();
    const key = usernameToDelete.trim().toLowerCase();
    const target = dictionary[key];
    if (!target) {
        throw new Error('El usuario seleccionado no existe.');
    }

    if (target.role === 'SUPERADMIN') {
        const superAdminCount = Object.values(dictionary).filter((u) => u.role === 'SUPERADMIN').length;
        if (superAdminCount <= 1) {
            throw new Error('No se puede eliminar al único SUPERADMIN del sistema.');
        }
    }

    const nextDictionary = { ...dictionary };
    delete nextDictionary[key];
    writeUsersDictionary(nextDictionary);
};
