import React, { useState } from 'react';
import type { SectionId } from '../data/mockData';
import HeadCMS from '../components/CMS/HeadCMS';
import ControlModule from '../components/CMS/ControlModule';
import Nodo from '../components/CMS/Nodo';
import Metrics from '../components/CMS/Metrics';
import PublisherForm from '../components/CMS/PublisherForm';
import { INITIAL_CMS_ITEMS, type CmsPostItem, type CmsPostType } from '../data/Cms';
import HeadPubliRegister from '../components/CMS/HeadPubliRegister';
import FilterRegister from '../components/CMS/FilterRegister';

interface CmsSectionProps {
  onSelectSection: (section: SectionId) => void;
}

type CmsFilterType = CmsPostType | 'TODOS';

export const CmsSection: React.FC<CmsSectionProps> = ({ onSelectSection }) => {
  const [items, setItems] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [filterType, setFilterType] = useState<CmsFilterType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'TODOS' || item.type === filterType;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.author.toLowerCase().includes(normalizedQuery);

    return matchesType && matchesSearch;
  });

  const handleCreatePost = (post: Omit<CmsPostItem, 'id' | 'code'>): CmsPostItem => {
    const highestCode = items.reduce((highest, item) => {
      const codeNumber = Number(item.code.match(/^TOM-(\d+)$/)?.[1]);
      return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
    }, 894);
    const created: CmsPostItem = {
      ...post,
      id: `cms-${Date.now()}`,
      code: `TOM-${highestCode + 1}`,
    };

    setItems((currentItems) => [created, ...currentItems]);
    return created;
  };

  const handleDeleteItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* TOP ADMIN COMMAND BAR */}
        <div className="border border-zinc-800 bg-[#0E0E12] px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <HeadCMS onSelectSection={onSelectSection} />
        </div>

        {/* MAIN CMS WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR NAVIGATION (3 COLS) */}
          <aside className="lg:col-span-3 space-y-6">
            <ControlModule />

            {/* Icecast / FLAC Server Status Card */}
            <Nodo />
          </aside>

          {/* MAIN WORKSPACE AREA (9 COLS) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 4 KPI METRIC CARDS */}
            <Metrics />

            {/* QUICK EDITORIAL PUBLISHER FORM */}
            <PublisherForm onCreatePost={handleCreatePost} />

            {/* EDITORIAL QUEUE TABLE */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              <HeadPubliRegister
                count={filteredItems.length}
                filterType={filterType}
                onFilterChange={setFilterType}
              />
              <FilterRegister
                items={filteredItems}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSelectSection={onSelectSection}
                onDeleteItem={handleDeleteItem}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
