import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Building2, 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  FolderTree
} from 'lucide-react';
import { INDUSTRIES, DEPARTMENTS } from '../../../data/categoriesData';
import { JOB_ROLES } from '../../../data/jobRolesList';
import { apiClient } from '../../../lib/apiClient';

export const AdminTaxonomiesTab: React.FC = () => {
  const [activeTaxonomy, setActiveTaxonomy] = useState<'industries' | 'departments' | 'job_roles'>('industries');
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Counts
  const totalIndustries = INDUSTRIES.length;
  const totalDepartments = DEPARTMENTS.length;
  const totalJobRoles = JOB_ROLES.length;

  const filteredIndustries = INDUSTRIES.filter(i => 
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDepartments = DEPARTMENTS.filter(d => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || d.industry_id === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const filteredJobRoles = JOB_ROLES.filter(r => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || r.industry_id === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards for Taxonomies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { setActiveTaxonomy('industries'); setSearch(''); }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTaxonomy === 'industries' 
              ? 'bg-blue-950/40 border-blue-500 shadow-sm' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Level 1: Industries</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalIndustries}</div>
          <div className="text-[11px] text-slate-400 mt-1">Standardized Top-Level Sectors</div>
        </div>

        <div 
          onClick={() => { setActiveTaxonomy('departments'); setSearch(''); }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTaxonomy === 'departments' 
              ? 'bg-purple-950/40 border-purple-500 shadow-sm' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Level 2: Departments</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalDepartments}</div>
          <div className="text-[11px] text-slate-400 mt-1">Functional Disciplines & Fields</div>
        </div>

        <div 
          onClick={() => { setActiveTaxonomy('job_roles'); setSearch(''); }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTaxonomy === 'job_roles' 
              ? 'bg-emerald-950/40 border-emerald-500 shadow-sm' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Level 3: Job Roles</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalJobRoles}</div>
          <div className="text-[11px] text-slate-400 mt-1">Global Standardized Positions</div>
        </div>
      </div>

      {/* Control Bar & Search */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-blue-400" />
              <span>Hierarchical Global Taxonomy Registry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Industry &rarr; Department &rarr; Job Role tree utilized across candidate search, filters, and indexing.
            </p>
          </div>

          {/* Switch taxonomy */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { setActiveTaxonomy('industries'); setSearch(''); }}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTaxonomy === 'industries' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Industries ({totalIndustries})
            </button>
            <button
              onClick={() => { setActiveTaxonomy('departments'); setSearch(''); }}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTaxonomy === 'departments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Departments ({totalDepartments})
            </button>
            <button
              onClick={() => { setActiveTaxonomy('job_roles'); setSearch(''); }}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTaxonomy === 'job_roles' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Job Roles ({totalJobRoles})
            </button>
          </div>
        </div>

        {/* Search & Industry Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-900">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTaxonomy.replace('_', ' ')}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeTaxonomy !== 'industries' && (
            <div className="sm:w-64">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Filter by Industry (All)</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content Rendering based on Active Taxonomy */}
      {activeTaxonomy === 'industries' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4">System Identifier (ID)</th>
                <th className="py-3 px-4">Linked Departments</th>
                <th className="py-3 px-4">Standard Roles Count</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIndustries.map((ind) => {
                const depts = DEPARTMENTS.filter(d => d.industry_id === ind.id);
                const roles = JOB_ROLES.filter(r => r.industry_id === ind.id);
                return (
                  <tr key={ind.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>{ind.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {ind.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-300">{depts.length} Departments</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-300">{roles.length} Job Roles</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTaxonomy === 'departments' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Department / Field</th>
                <th className="py-3 px-4">Parent Industry</th>
                <th className="py-3 px-4">Department Identifier (ID)</th>
                <th className="py-3 px-4">Roles Count</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDepartments.map((dept) => {
                const ind = INDUSTRIES.find(i => i.id === dept.industry_id);
                const roles = JOB_ROLES.filter(r => r.department_id === dept.id);
                return (
                  <tr key={dept.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {ind?.name || dept.industry_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {dept.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-300">{roles.length} Roles</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTaxonomy === 'job_roles' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Job Role Position</th>
                <th className="py-3 px-4">Parent Department</th>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4">System Identifier</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobRoles.slice(0, 100).map((role) => {
                const ind = INDUSTRIES.find(i => i.id === role.industry_id);
                const dept = DEPARTMENTS.find(d => d.id === role.department_id);
                return (
                  <tr key={role.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span>{role.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {dept?.name || role.department_id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {ind?.name || role.industry_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {role.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
