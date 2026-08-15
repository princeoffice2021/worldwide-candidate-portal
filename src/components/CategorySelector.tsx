import React, { useState, useEffect, useMemo } from 'react';
import { INDUSTRIES, DEPARTMENTS, getDepartmentsByIndustryId, getRolesByDepartmentId, searchRoles, getIndustryById, getDepartmentById } from '../data/categoriesData';
import { JOB_ROLES } from '../data/jobRolesList';
import { JobRole } from '../types';
import { Briefcase, Search, Check, ChevronRight, Sparkles, X } from 'lucide-react';

interface CategorySelectorValue {
  industry_id: string;
  industry_name: string;
  department_id: string;
  department_name: string;
  job_role_id: string;
  job_role_name: string;
  custom_profession?: string;
  display_label: string;
}

interface CategorySelectorProps {
  value?: {
    industry_id?: string | null;
    industry_name?: string | null;
    department_id?: string | null;
    department_name?: string | null;
    job_role_id?: string | null;
    job_role_name?: string | null;
    custom_profession?: string | null;
    skill_category?: string;
  };
  onChange: (selected: CategorySelectorValue) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  // Mode: 'hierarchical' | 'search' | 'other'
  const [activeTab, setActiveTab] = useState<'hierarchical' | 'search'>('hierarchical');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Selected state
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>(value?.industry_id || 'ind_healthcare');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(value?.department_id || '');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(value?.job_role_id || '');
  const [customProfession, setCustomProfession] = useState<string>(value?.custom_profession || '');
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(
    Boolean(value?.custom_profession) || value?.job_role_id === 'other_custom'
  );

  // Departments for selected Industry
  const availableDepartments = useMemo(() => {
    return getDepartmentsByIndustryId(selectedIndustryId);
  }, [selectedIndustryId]);

  // Roles for selected Department
  const availableRoles = useMemo(() => {
    if (!selectedDeptId) return [];
    return getRolesByDepartmentId(selectedDeptId);
  }, [selectedDeptId]);

  // Direct Search Results
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    return searchRoles(globalSearchQuery, 30);
  }, [globalSearchQuery]);

  // Sync state when value prop changes externally
  useEffect(() => {
    if (value) {
      if (value.industry_id) setSelectedIndustryId(value.industry_id);
      if (value.department_id) setSelectedDeptId(value.department_id);
      if (value.job_role_id) setSelectedRoleId(value.job_role_id);
      if (value.custom_profession !== undefined) setCustomProfession(value.custom_profession || '');
      if (value.custom_profession || value.job_role_id === 'other_custom') {
        setIsOtherSelected(true);
      } else if (value.job_role_id) {
        setIsOtherSelected(false);
      }
    }
  }, [value?.industry_id, value?.department_id, value?.job_role_id, value?.custom_profession]);

  // Initialize/Update default department when Industry changes
  useEffect(() => {
    if (availableDepartments.length > 0) {
      const matchDept = availableDepartments.find((d) => d.id === selectedDeptId);
      if (!matchDept) {
        setSelectedDeptId(availableDepartments[0].id);
      }
    } else {
      setSelectedDeptId('');
    }
  }, [selectedIndustryId, availableDepartments]);

  // Handle Industry Select
  const handleIndustryChange = (indId: string) => {
    setSelectedIndustryId(indId);
    setIsOtherSelected(false);
    const depts = getDepartmentsByIndustryId(indId);
    if (depts.length > 0) {
      const firstDept = depts[0];
      setSelectedDeptId(firstDept.id);
      const roles = getRolesByDepartmentId(firstDept.id);
      if (roles.length > 0) {
        handleRoleSelect(roles[0], indId, firstDept.id);
      }
    }
  };

  // Handle Department Select
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setIsOtherSelected(false);
    const roles = getRolesByDepartmentId(deptId);
    if (roles.length > 0) {
      handleRoleSelect(roles[0], selectedIndustryId, deptId);
    }
  };

  // Handle Role Select
  const handleRoleSelect = (role: JobRole, overrideIndId?: string, overrideDeptId?: string) => {
    const indId = overrideIndId || selectedIndustryId;
    const deptId = overrideDeptId || selectedDeptId;
    const indObj = getIndustryById(indId);
    const deptObj = getDepartmentById(deptId);

    setSelectedIndustryId(indId);
    setSelectedDeptId(deptId);
    setSelectedRoleId(role.id);
    setIsOtherSelected(false);

    onChange({
      industry_id: indId,
      industry_name: indObj?.name || 'General',
      department_id: deptId,
      department_name: deptObj?.name || 'General',
      job_role_id: role.id,
      job_role_name: role.name,
      display_label: role.name,
    });
  };

  // Handle Direct Global Search Selection
  const handleSearchResultSelect = (role: JobRole) => {
    const indObj = getIndustryById(role.industry_id);
    const deptObj = getDepartmentById(role.department_id);

    setSelectedIndustryId(role.industry_id);
    setSelectedDeptId(role.department_id);
    setSelectedRoleId(role.id);
    setIsOtherSelected(false);
    setGlobalSearchQuery('');

    onChange({
      industry_id: role.industry_id,
      industry_name: indObj?.name || 'General',
      department_id: role.department_id,
      department_name: deptObj?.name || 'General',
      job_role_id: role.id,
      job_role_name: role.name,
      display_label: role.name,
    });
  };

  // Handle Custom Profession Selection ("Other")
  const handleSelectOther = () => {
    setIsOtherSelected(true);
    setSelectedRoleId('other_custom');
    const indObj = getIndustryById(selectedIndustryId);
    const deptObj = getDepartmentById(selectedDeptId);

    onChange({
      industry_id: selectedIndustryId,
      industry_name: indObj?.name || 'General',
      department_id: selectedDeptId,
      department_name: deptObj?.name || 'General',
      job_role_id: 'other_custom',
      job_role_name: customProfession || 'Other Profession',
      custom_profession: customProfession,
      display_label: customProfession || 'Other Profession',
    });
  };

  const handleCustomTextChange = (text: string) => {
    setCustomProfession(text);
    if (isOtherSelected) {
      const indObj = getIndustryById(selectedIndustryId);
      const deptObj = getDepartmentById(selectedDeptId);
      onChange({
        industry_id: selectedIndustryId,
        industry_name: indObj?.name || 'General',
        department_id: selectedDeptId,
        department_name: deptObj?.name || 'General',
        job_role_id: 'other_custom',
        job_role_name: text.trim() || 'Other Profession',
        custom_profession: text.trim(),
        display_label: text.trim() || 'Other Profession',
      });
    }
  };

  const currentIndustryObj = getIndustryById(selectedIndustryId);
  const currentDeptObj = getDepartmentById(selectedDeptId);
  const currentRoleObj = JOB_ROLES.find((r) => r.id === selectedRoleId);

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-4">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <label className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Profession & Job Role Selection (1000+ Standard Roles) *</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select your exact Industry, Department, and Job Role to ensure employers find you easily.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-300/50">
          <button
            type="button"
            onClick={() => setActiveTab('hierarchical')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'hierarchical'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            3-Step Hierarchy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Direct Search</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Preview Badge */}
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 shadow-xs flex flex-wrap items-center text-xs font-bold text-slate-800 gap-1.5">
        <span className="text-slate-400 font-semibold text-[11px]">Selected Profession:</span>
        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md text-[11px] border border-blue-100">
          {currentIndustryObj?.name || 'Healthcare'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md text-[11px] border border-blue-100">
          {currentDeptObj?.name || 'Nursing'}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md text-xs font-extrabold shadow-xs">
          {isOtherSelected ? customProfession || 'Other Profession' : currentRoleObj?.name || 'Staff Nurse'}
        </span>
      </div>

      {/* TAB 1: 3-STEP HIERARCHICAL SELECTOR */}
      {activeTab === 'hierarchical' && (
        <div className="space-y-4">
          
          {/* STEP 1: INDUSTRY SELECTOR */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Step 1: Select Industry (35 Major Sectors)
            </label>
            <select
              value={selectedIndustryId}
              onChange={(e) => handleIndustryChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: DEPARTMENT SELECTOR */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Step 2: Select Department / Field ({availableDepartments.length} Departments)
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              {availableDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 3: JOB ROLE SELECTOR */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Step 3: Select Specific Job Role ({availableRoles.length} Roles in this Department)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
              {availableRoles.map((role) => {
                const isSelected = selectedRoleId === role.id && !isOtherSelected;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-blue-50/50 hover:border-blue-200'
                    }`}
                  >
                    <span className="truncate">{role.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}

              {/* UNLISTED ROLE FALLBACK OPTION */}
              <button
                type="button"
                onClick={handleSelectOther}
                className={`p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer border col-span-1 sm:col-span-2 ${
                  isOtherSelected
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-amber-50'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Other Profession / Unlisted Job Role</span>
                </span>
                {isOtherSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DIRECT GLOBAL ROLE SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search among 1,000+ job roles (e.g. ICU Nurse, Driver, Welder, Accountant)..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {globalSearchQuery.trim() ? (
            <div className="max-h-60 overflow-y-auto space-y-1 bg-white p-2 rounded-xl border border-slate-200">
              {searchResults.length > 0 ? (
                searchResults.map((role) => {
                  const ind = getIndustryById(role.industry_id);
                  const dept = getDepartmentById(role.department_id);
                  const isSelected = selectedRoleId === role.id && !isOtherSelected;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSearchResultSelect(role)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{role.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {ind?.name} &rarr; {dept?.name}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching roles found. Try searching with another keyword or use 3-Step selection.
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
              Type any title above to instantly search through 1,000+ worldwide job roles.
            </div>
          )}
        </div>
      )}

      {/* CUSTOM PROFESSION INPUT IF OTHER SELECTED */}
      {isOtherSelected && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 animate-fadeIn">
          <label className="block text-xs font-bold text-amber-900">
            Specify Your Custom Profession / Role Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Solar Photovoltaic Maintenance Tech, Heavy Crane Operator..."
            value={customProfession}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <p className="text-[10px] text-amber-800 font-medium">
            This custom role title will be displayed directly on your candidate profile.
          </p>
        </div>
      )}

    </div>
  );
};
