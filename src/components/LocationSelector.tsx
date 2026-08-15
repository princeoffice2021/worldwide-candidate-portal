import React from 'react';
import { COUNTRY_CODES, SAMPLE_ADMIN1_DATA, SAMPLE_ADMIN2_DATA } from '../data/countries';
import { LocationHierarchy } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { MapPin, Globe } from 'lucide-react';

interface LocationSelectorProps {
  value: LocationHierarchy;
  onChange: (loc: LocationHierarchy) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange }) => {
  const selectedCountry = COUNTRY_CODES.find((c) => c.name === value.country) || COUNTRY_CODES[0];

  const admin1List = SAMPLE_ADMIN1_DATA[selectedCountry.code] || [];
  const admin2Map = SAMPLE_ADMIN2_DATA[selectedCountry.code] || {};
  const admin2List = value.admin_level_1 ? admin2Map[value.admin_level_1] || [] : [];

  const handleCountryChange = (countryName: string) => {
    const cObj = COUNTRY_CODES.find((c) => c.name === countryName) || COUNTRY_CODES[0];
    onChange({
      country: cObj.name,
      country_code: cObj.code,
      admin_level_1: '',
      admin_level_1_type: cObj.admin1_label || 'State / Region',
      admin_level_2: '',
      admin_level_2_type: cObj.admin2_label || 'District / City',
      admin_level_3: '',
      admin_level_3_type: cObj.admin3_label || 'Tehsil / Sub-district',
      village_or_town: value.village_or_town || '',
      area_other: value.area_other || '',
    });
  };

  const handleAdmin1Change = (val: string) => {
    onChange({
      ...value,
      admin_level_1: val,
      admin_level_1_type: selectedCountry.admin1_label || 'State / Region',
      admin_level_2: '', // Reset lower level on parent change
    });
  };

  const handleAdmin2Change = (val: string) => {
    onChange({
      ...value,
      admin_level_2: val,
      admin_level_2_type: selectedCountry.admin2_label || 'District / City',
    });
  };

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
      
      <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm pb-2 border-b border-slate-200">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span>Worldwide Location Hierarchy</span>
        <span className="text-[10px] bg-blue-50 text-blue-900 border border-blue-200 font-bold px-2 py-0.5 rounded-full">
          Global
        </span>
      </div>

      {/* Row 1: Country & State / Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Country Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Country *</span>
          </label>
          <select
            value={value.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name} ({c.dial_code})
              </option>
            ))}
          </select>
        </div>

        {/* Admin 1 (State / Province / Region) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedCountry.admin1_label || 'State / Province / Region'} *
          </label>
          {admin1List.length > 0 ? (
            <select
              value={value.admin_level_1 || ''}
              onChange={(e) => handleAdmin1Change(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="">-- Select {selectedCountry.admin1_label || 'State'} --</option>
              {admin1List.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={`Enter ${selectedCountry.admin1_label || 'State/Province'}`}
              value={value.admin_level_1 || ''}
              onChange={(e) => handleAdmin1Change(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          )}
        </div>
      </div>

      {/* Row 2: District / City & Sub-region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Admin 2 (District / City / County) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedCountry.admin2_label || 'District / City'}
          </label>
          {admin2List.length > 0 ? (
            <select
              value={value.admin_level_2 || ''}
              onChange={(e) => handleAdmin2Change(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">-- Select {selectedCountry.admin2_label || 'District'} --</option>
              {admin2List.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={`Enter ${selectedCountry.admin2_label || 'District/City'}`}
              value={value.admin_level_2 || ''}
              onChange={(e) => handleAdmin2Change(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          )}
        </div>

        {/* Admin 3 (Tehsil / Sub-district / Block) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedCountry.admin3_label || 'Tehsil / Sub-region'} (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Padampur, Deira, Al Kharj"
            value={value.admin_level_3 || ''}
            onChange={(e) => onChange({ ...value, admin_level_3: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Row 3: Village / Town Manual Text Input with Voice */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Village / Town / Locality *
          </label>
          <VoiceInputButton
            onTranscript={(text) =>
              onChange({
                ...value,
                village_or_town: value.village_or_town ? `${value.village_or_town} ${text}` : text,
              })
            }
            fieldLabel="Village or Town"
          />
        </div>
        <input
          type="text"
          placeholder="Enter village, town, ward, or exact locality name"
          value={value.village_or_town || ''}
          onChange={(e) => onChange({ ...value, village_or_town: e.target.value })}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </div>

      {/* Row 4: Additional Free Text / Landmark Fallback */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Landmark / Mohalla / Extra Location Details
          </label>
          <VoiceInputButton
            onTranscript={(text) =>
              onChange({
                ...value,
                area_other: value.area_other ? `${value.area_other} ${text}` : text,
              })
            }
            fieldLabel="Additional Location Details"
          />
        </div>
        <input
          type="text"
          placeholder="e.g. Near Bus Stand, Main Bazaar, Landmark, Ward No. 5"
          value={value.area_other || ''}
          onChange={(e) => onChange({ ...value, area_other: e.target.value })}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Candidates can enter exact location details freely so employers near them can easily discover them.
        </p>
      </div>

    </div>
  );
};
