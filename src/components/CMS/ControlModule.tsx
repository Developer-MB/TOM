import React from 'react';
import {
    Activity,
    Calendar,
    Camera,
    Disc,
    Mic,
    Radio,
    ShieldCheck,
    ShoppingBag,
} from 'lucide-react';
import {
    hasSectionPermission,
    type CmsAuthSession,
    type CmsSectionPermission,
} from '../../data/CmsUsers';

export type CmsComposerType =
    | 'RECOMENDACION'
    | 'GALERIA'
    | 'VIDEO'
    | 'TOUR'
    | 'RADIO'
    | 'MERCH'
    | 'USUARIOS';

interface ControlModuleProps {
    session: CmsAuthSession;
    activeComposer: CmsComposerType;
    onSelectComposer: (type: CmsComposerType) => void;
    recommendationCount: number;
    videoCount: number;
    galleryCount: number;
    tourCount: number;
    radioCount: number;
    merchCount: number;
    userCount?: number;
}

const ControlModule: React.FC<ControlModuleProps> = ({
    session,
    activeComposer,
    onSelectComposer,
    recommendationCount,
    videoCount,
    galleryCount,
    tourCount,
    radioCount,
    merchCount,
    userCount = 0,
}) => {
    const isSuperAdmin = session.role === 'SUPERADMIN';

    const navItems: Array<{
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        count: string | number;
        composerType?: CmsComposerType;
        permission?: CmsSectionPermission;
        superAdminOnly?: boolean;
    }> = [
        {
            label: 'PANEL CENTRAL',
            icon: Activity,
            count: isSuperAdmin ? 'FULL CMS' : 'LIMITADO',
            superAdminOnly: true,
        },
        {
            label: 'RECOMENDACIONES',
            icon: Disc,
            count: recommendationCount,
            composerType: 'RECOMENDACION',
            permission: 'RECOMENDACION',
        },
        {
            label: 'GALERÍAS',
            icon: Camera,
            count: galleryCount,
            composerType: 'GALERIA',
            permission: 'GALERIA',
        },
        {
            label: 'VIDEOS',
            icon: Mic,
            count: videoCount,
            composerType: 'VIDEO',
            permission: 'VIDEO',
        },
        {
            label: 'GIRAS',
            icon: Calendar,
            count: tourCount,
            composerType: 'TOUR',
            permission: 'TOUR',
        },
        {
            label: 'CABINA RADIO 24/7',
            icon: Radio,
            count: radioCount || 'ON AIR',
            composerType: 'RADIO',
            permission: 'RADIO',
        },
        {
            label: 'MERCANCÍA',
            icon: ShoppingBag,
            count: merchCount,
            composerType: 'MERCH',
            permission: 'MERCH',
        },
        {
            label: 'USUARIOS Y ROLES',
            icon: ShieldCheck,
            count: userCount || 'RBAC',
            composerType: 'USUARIOS',
            permission: 'CMS',
            superAdminOnly: true,
        },
    ];

    const visibleItems = navItems.filter((item) => {
        if (item.superAdminOnly) return isSuperAdmin;
        if (!item.permission) return true;
        return hasSectionPermission(session, item.permission);
    });

    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-3 pb-3 mb-2 border-b border-zinc-800 flex items-center justify-between">
                <span>MÓDULOS HABILITADOS</span>
                <span className="text-[9px] text-zinc-400">{visibleItems.length}</span>
            </div>
            <nav className="space-y-1">
                {visibleItems.map((nav) => {
                    const Icon = nav.icon;
                    const active = nav.composerType ? activeComposer === nav.composerType : false;
                    return (
                        <button
                            key={nav.label}
                            type="button"
                            onClick={() => {
                                if (nav.composerType) {
                                    onSelectComposer(nav.composerType);
                                }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                                active
                                    ? 'bg-[#DC2626] text-white font-bold'
                                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center gap-2.5 truncate">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{nav.label}</span>
                            </span>
                            {nav.count !== '' && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 ${
                                        active
                                            ? 'bg-black/30 text-white'
                                            : 'bg-[#070709] text-zinc-500 border border-zinc-800'
                                    }`}
                                >
                                    {nav.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default ControlModule;
