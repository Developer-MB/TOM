import React, { useEffect, useMemo, useState } from 'react';
import {
    CheckCircle2,
    ClipboardEdit,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    RotateCcw,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import {
    ALL_CONTENT_PERMISSIONS,
    ALL_SUPERADMIN_PERMISSIONS,
    CMS_PERMISSION_LABELS,
    CMS_ROLE_STYLES,
    CMS_USERS_UPDATED_EVENT,
    deleteCmsUser,
    encodeCmsPassword,
    getRoleStyle,
    isEncodedPassword,
    readUsersDictionary,
    upsertCmsUser,
    type CmsSectionPermission,
    type CmsUserAccount,
    type CmsUserRole,
} from '../../data/CmsUsers';

interface ManageUsersFormProps {
    currentUsername: string;
    onSessionUpdated?: () => void;
}

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';

const ROLE_OPTIONS: CmsUserRole[] = [
    'SUPERADMIN',
    'ADMIN',
    'EDITOR',
    'MODERADOR',
    'COLABORADOR',
];

const ManageUsersForm: React.FC<ManageUsersFormProps> = ({
    currentUsername,
    onSessionUpdated,
}) => {
    const [usersDict, setUsersDict] = useState<Record<string, CmsUserAccount>>(() =>
        readUsersDictionary(),
    );
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<CmsUserRole>('EDITOR');
    const [permissions, setPermissions] = useState<CmsSectionPermission[]>(['RECOMENDACION']);
    const [expandedHashUser, setExpandedHashUser] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        const syncUsers = () => {
            setUsersDict(readUsersDictionary());
        };
        window.addEventListener(CMS_USERS_UPDATED_EVENT, syncUsers);
        window.addEventListener('storage', syncUsers);
        return () => {
            window.removeEventListener(CMS_USERS_UPDATED_EVENT, syncUsers);
            window.removeEventListener('storage', syncUsers);
        };
    }, []);

    const resetForm = () => {
        setEditingKey(null);
        setUsername('');
        setDisplayName('');
        setPassword('');
        setShowPassword(false);
        setRole('EDITOR');
        setPermissions(['RECOMENDACION']);
        setErrorMsg(null);
    };

    const handleSelectUserToEdit = (account: CmsUserAccount) => {
        setEditingKey(account.username);
        setUsername(account.username);
        setDisplayName(account.displayName);
        setPassword('');
        setShowPassword(false);
        setRole(account.role);
        setPermissions(
            account.role === 'SUPERADMIN'
                ? [...ALL_SUPERADMIN_PERMISSIONS]
                : [...account.permissions],
        );
        setErrorMsg(null);
        setSuccessMsg(null);
    };

    const handleRoleChange = (nextRole: CmsUserRole) => {
        setRole(nextRole);
        if (nextRole === 'SUPERADMIN') {
            setPermissions([...ALL_SUPERADMIN_PERMISSIONS]);
        } else {
            const contentOnly = permissions.filter((perm) => perm !== 'CMS');
            setPermissions(contentOnly.length > 0 ? contentOnly : ['RECOMENDACION']);
        }
    };

    const handleTogglePermission = (perm: CmsSectionPermission) => {
        if (role === 'SUPERADMIN') return;
        setPermissions((current) =>
            current.includes(perm)
                ? current.filter((item) => item !== perm)
                : [...current, perm],
        );
    };

    const previewEncodedHash = useMemo(() => {
        const trimmed = password.trim();
        if (!trimmed) {
            if (editingKey && usersDict[editingKey]) {
                return usersDict[editingKey].password;
            }
            return null;
        }
        return encodeCmsPassword(trimmed, 'preview00000000');
    }, [password, editingKey, usersDict]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            if (!editingKey && usersDict[username.trim().toLowerCase()]) {
                throw new Error(
                    `El usuario "${username.trim().toLowerCase()}" ya existe. Selecciónalo en la tabla inferior si deseas modificarlo.`,
                );
            }

            const saved = upsertCmsUser({
                previousUsername: editingKey ?? undefined,
                username,
                password: password.trim() || undefined,
                displayName: displayName.trim() || username.trim(),
                role,
                permissions,
            });

            setUsersDict(readUsersDictionary());
            onSessionUpdated?.();

            setSuccessMsg(
                editingKey
                    ? `Usuario "${saved.username}" (${saved.role}) actualizado y contraseña codificada con SHA-256 + Salt.`
                    : `Usuario "${saved.username}" (${saved.role}) creado con contraseña codificada (SHA-256 + Salt).`,
            );
            resetForm();
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'No se pudo guardar el usuario.');
        }
    };

    const handleDeleteUser = (targetUsername: string) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            if (targetUsername === currentUsername) {
                throw new Error('No puedes eliminar el usuario con el que tienes la sesión activa.');
            }
            deleteCmsUser(targetUsername);
            setUsersDict(readUsersDictionary());
            if (editingKey === targetUsername) {
                resetForm();
            }
            setSuccessMsg(`Usuario "${targetUsername}" eliminado del diccionario.`);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
        }
    };

    const usersList = Object.values(usersDict);
    const activeRoleStyle = getRoleStyle(role);

    return (
        <div className="space-y-6">
            {/* FORMULARIO CREAR / MODIFICAR USUARIO */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-[#DC2626]" />
                        <div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
                                {editingKey
                                    ? `MODO EDICIÓN DE USUARIO · @${editingKey}`
                                    : 'CONTROL DE ACCESO Y PERMISOS (EXCLUSIVO SUPERADMIN)'}
                            </span>
                            <h2 className="font-display text-xl font-black uppercase text-white">
                                {editingKey ? 'Modificar Usuario, Contraseña y Permisos' : 'Agregar Nuevo Usuario al CMS'}
                            </h2>
                        </div>
                    </div>

                    {editingKey && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase text-zinc-300 hover:border-[#DC2626] hover:text-white cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Nuevo usuario
                        </button>
                    )}
                </div>

                {errorMsg && (
                    <div
                        role="alert"
                        className="mb-5 border border-red-900 bg-red-950/40 px-4 py-3 font-mono text-xs text-red-300"
                    >
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-5 flex items-center gap-2 border border-emerald-700/60 bg-emerald-950/40 px-4 py-3 font-mono text-xs text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <label className="block">
                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                Nombre de Usuario (Login) *
                            </span>
                            <input
                                required
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ej. manro, editor_giras"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                Nombre para Mostrar
                            </span>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Ej. Manro / Editor Giras"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                {editingKey ? 'Nueva Contraseña (Opcional)' : 'Contraseña (Se codificará) *'}
                            </span>
                            <div className="relative">
                                <input
                                    required={!editingKey}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={
                                        editingKey
                                            ? 'Vacío = conservar hash actual'
                                            : 'Mínimo 4 caracteres'
                                    }
                                    className={`${fieldClassName} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                Rol del Usuario *
                            </span>
                            <select
                                value={role}
                                onChange={(e) => handleRoleChange(e.target.value as CmsUserRole)}
                                className={fieldClassName}
                            >
                                {ROLE_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* PREVISUALIZACIÓN DEL HASH CODIFICADO SHA-256 + SALT */}
                    <div className="border border-zinc-800 bg-[#070709] px-4 py-3 font-mono text-[11px] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="uppercase text-[10px] tracking-wider text-zinc-500">
                                {password.trim()
                                    ? 'HASH QUE SE ALMACENARÁ (SHA-256 + SALT + 256 ITERACIONES):'
                                    : editingKey
                                        ? 'HASH ACTUAL CONSERVADO EN DICCIONARIO:'
                                        : 'INGRESA UNA CONTRASEÑA PARA GENERAR SU HASH CRIPTOGRÁFICO:'}
                            </span>
                        </div>
                        <code className="text-[10px] text-emerald-400 break-all bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5">
                            {previewEncodedHash ?? 'tom$sha256$<salt_aleatorio>$<digest_256_bits>'}
                        </code>
                    </div>

                    {/* VISTA PREVIA DEL BADGE DE ROL EN LA BARRA SUPERIOR */}
                    <div className="border border-zinc-800 bg-[#070709] p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="font-mono text-xs text-zinc-300">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">
                                VISTA PREVIA EN BARRA DE SESIÓN Y COLOR DE ROL:
                            </span>
                            <span>
                                <strong className="text-white">{username.trim() || 'usuario'}</strong>{' '}
                                <span className={`font-bold uppercase ${activeRoleStyle.textClass}`}>
                                    ({activeRoleStyle.label})
                                </span>
                            </span>
                            <p className="text-[11px] text-zinc-500 mt-1">{activeRoleStyle.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                            {ROLE_OPTIONS.map((r) => {
                                const st = CMS_ROLE_STYLES[r];
                                return (
                                    <span
                                        key={r}
                                        className={`border px-2 py-1 font-bold uppercase ${st.badgeClass}`}
                                    >
                                        ({st.label})
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* PERMISOS POR SECCIÓN */}
                    <div className="border border-zinc-800 bg-[#070709] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                                    Permisos de Secciones Asignadas
                                </h3>
                                <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                                    {role === 'SUPERADMIN'
                                        ? 'El rol SUPERADMIN tiene acceso obligatorio a todas las secciones (Recomendaciones, Galería, Videos, Giras, Radio, Merch) y a la administración completa del CMS.'
                                        : 'Selecciona una o varias secciones que este usuario podrá visualizar y modificar dentro del CMS:'}
                                </p>
                            </div>

                            {role !== 'SUPERADMIN' && (
                                <div className="flex items-center gap-2 font-mono text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => setPermissions([...ALL_CONTENT_PERMISSIONS])}
                                        className="border border-zinc-700 px-2.5 py-1 uppercase text-zinc-300 hover:border-[#DC2626] hover:text-white cursor-pointer"
                                    >
                                        Todas las secciones
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPermissions(['RECOMENDACION'])}
                                        className="border border-zinc-700 px-2.5 py-1 uppercase text-zinc-400 hover:border-zinc-500 hover:text-white cursor-pointer"
                                    >
                                        Solo 1 sección
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {ALL_CONTENT_PERMISSIONS.map((perm) => {
                                const checked = role === 'SUPERADMIN' || permissions.includes(perm);
                                return (
                                    <label
                                        key={perm}
                                        className={`flex items-center justify-between border p-3 font-mono text-xs transition-colors ${
                                            checked
                                                ? 'border-[#DC2626]/80 bg-[#DC2626]/10 text-white'
                                                : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-700'
                                        } ${role === 'SUPERADMIN' ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={role === 'SUPERADMIN'}
                                                onChange={() => handleTogglePermission(perm)}
                                                className="accent-[#DC2626] h-4 w-4"
                                            />
                                            <span className="uppercase font-bold">
                                                {CMS_PERMISSION_LABELS[perm]}
                                            </span>
                                        </span>
                                        <span className="text-[10px] text-zinc-500">{perm}</span>
                                    </label>
                                );
                            })}

                            {/* PERMISO EXCLUSIVO DE SUPERADMIN: CMS & USUARIOS */}
                            <div
                                className={`flex items-center justify-between border p-3 font-mono text-xs ${
                                    role === 'SUPERADMIN'
                                        ? 'border-[#DC2626] bg-[#DC2626]/20 text-white'
                                        : 'border-zinc-800/60 bg-zinc-950/60 text-zinc-600'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={role === 'SUPERADMIN'}
                                        disabled
                                        className="accent-[#DC2626] h-4 w-4"
                                    />
                                    <span className="uppercase font-bold">
                                        {CMS_PERMISSION_LABELS.CMS}
                                    </span>
                                </span>
                                <span className="text-[9px] uppercase px-1.5 py-0.5 border border-current">
                                    SOLO SUPERADMIN
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        {editingKey && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="border border-zinc-700 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-zinc-500 hover:text-white cursor-pointer"
                            >
                                CANCELAR
                            </button>
                        )}
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors cursor-pointer"
                        >
                            {editingKey ? (
                                <>
                                    <KeyRound className="w-4 h-4" /> GUARDAR CAMBIOS DE USUARIO
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" /> REGISTRAR USUARIO EN DICCIONARIO
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* TABLA DE USUARIOS DEL DICCIONARIO */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-[#DC2626]" />
                        <h3 className="font-display text-lg font-black uppercase text-white">
                            Diccionario de Usuarios Registrados ({usersList.length})
                        </h3>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Contraseñas Codificadas (SHA-256 + Salt)
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-[#070709] font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                                <th className="py-3 px-4">USUARIO (ROL)</th>
                                <th className="py-3 px-4">NOMBRE VISIBLE</th>
                                <th className="py-3 px-4">HASH DE CONTRASEÑA (CODIFICADA)</th>
                                <th className="py-3 px-4">SECCIONES PERMITIDAS</th>
                                <th className="py-3 px-4 text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/80 font-mono text-xs">
                            {usersList.map((account, index) => {
                                const rStyle = getRoleStyle(account.role);
                                const isBeingEdited = editingKey === account.username;
                                const isExpanded = expandedHashUser === account.username;
                                const encoded = isEncodedPassword(account.password);
                                const displayHash = isExpanded
                                    ? account.password
                                    : `${account.password.slice(0, 28)}…${account.password.slice(-8)}`;

                                return (
                                    <tr
                                        key={account.username}
                                        className={`${
                                            isBeingEdited
                                                ? 'bg-[#DC2626]/10'
                                                : index % 2 === 0
                                                    ? 'bg-[#0E0E12]'
                                                    : 'bg-[#17171B]'
                                        } hover:bg-zinc-800/70 transition-colors`}
                                    >
                                        <td className="py-3.5 px-4">
                                            <span className="font-bold text-white">{account.username}</span>{' '}
                                            <span className={`font-bold uppercase ${rStyle.textClass}`}>
                                                ({rStyle.label})
                                            </span>
                                            {account.username === currentUsername && (
                                                <span className="ml-2 border border-emerald-700/60 bg-emerald-950/60 px-1.5 py-0.5 text-[9px] uppercase text-emerald-300">
                                                    SESIÓN ACTUAL
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-zinc-300">{account.displayName}</td>
                                        <td className="py-3.5 px-4 text-zinc-400">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 border border-emerald-700/50 bg-emerald-950/40 px-1.5 py-0.5 text-[9px] uppercase text-emerald-400">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    {encoded ? 'SHA-256' : 'LEGACY'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedHashUser(
                                                            isExpanded ? null : account.username,
                                                        )
                                                    }
                                                    className="bg-[#070709] border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-[10px] text-zinc-300 break-all text-left cursor-pointer"
                                                    title="Clic para expandir o contraer el hash completo"
                                                >
                                                    {displayHash}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {account.permissions.map((perm) => (
                                                    <span
                                                        key={perm}
                                                        className={`text-[10px] px-2 py-0.5 uppercase border ${
                                                            perm === 'CMS'
                                                                ? 'border-[#DC2626]/70 bg-[#DC2626]/15 text-[#EF4444] font-bold'
                                                                : 'border-zinc-700 bg-[#070709] text-zinc-300'
                                                        }`}
                                                    >
                                                        {CMS_PERMISSION_LABELS[perm]}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectUserToEdit(account)}
                                                    className="p-1.5 text-amber-400 hover:text-white border border-amber-900 hover:border-amber-500 cursor-pointer"
                                                    title={`Editar usuario ${account.username}`}
                                                    aria-label={`Editar usuario ${account.username}`}
                                                >
                                                    <ClipboardEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(account.username)}
                                                    disabled={account.username === currentUsername}
                                                    className="p-1.5 text-zinc-400 hover:text-[#DC2626] border border-zinc-800 hover:border-[#DC2626] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={
                                                        account.username === currentUsername
                                                            ? 'No puedes eliminar tu propio usuario en sesión'
                                                            : `Eliminar usuario ${account.username}`
                                                    }
                                                    aria-label={`Eliminar usuario ${account.username}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsersForm;
