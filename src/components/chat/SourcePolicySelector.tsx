import React, { useState, useRef, useEffect } from 'react';
import type { SourcePolicy, SourceGroup } from '../../types/chat';
import {
  SOURCE_PRESETS,
  getPresetFromPolicy,
  isExternalSourcesEnabled,
  areGroupsEqual,
} from '../../utils/sourcePolicy';
import { Database, ChevronDown, Check, Globe, Shield, Info, Layers } from 'lucide-react';

interface SourcePolicySelectorProps {
  currentPolicy?: SourcePolicy;
  onPolicyChange: (newPolicy: SourcePolicy) => void;
  disabled?: boolean;
}

export const SourcePolicySelector: React.FC<SourcePolicySelectorProps> = ({
  currentPolicy,
  onPolicyChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPreset = getPresetFromPolicy(currentPolicy);
  const allowExternal = isExternalSourcesEnabled();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPreset = (preset: typeof SOURCE_PRESETS[0]) => {
    onPolicyChange(preset.policy);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left select-none">
      {/* Trigger Button */}
      <button
        type="button"
        id="source-policy-selector-btn"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer w-[96.58px] h-[43.2px] ${
          isOpen
            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Chọn phạm vi nguồn tài liệu"
        aria-label="Chọn nguồn tài liệu"
        aria-expanded={isOpen}
      >
        <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="text-gray-500 font-normal hidden sm:inline">Nguồn:</span>
        <span className="font-semibold text-gray-900 truncate max-w-[130px] sm:max-w-[170px]">
          {currentPreset.shortLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          id="source-policy-dropdown-menu"
          className="absolute bottom-full mb-2 left-0 sm:left-0 sm:right-auto w-[280px] sm:w-[310px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Nguồn trong Database
              </span>
            </div>
            <span className="text-[10px] text-gray-400">V2-G Policy</span>
          </div>

          {/* Database Source Options */}
          <div className="p-1.5 space-y-0.5">
            {SOURCE_PRESETS.map((preset) => {
              const isSelected = areGroupsEqual(
                preset.policy.groups,
                currentPolicy?.groups || ['BYT', 'VN_ASSOC', 'INTL_TOP_ASSOC']
              );

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-tight text-gray-900">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-gray-500 leading-snug mt-0.5">
                      {preset.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* External Sources Section */}
          <div className="p-2.5 bg-gray-50/60 border-t border-gray-100">
            <label
              className={`flex items-start gap-2.5 select-none ${
                allowExternal ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                disabled={!allowExternal}
                defaultChecked={false}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">
                    Nguồn ngoài Database
                  </span>
                  {!allowExternal && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-gray-200 text-gray-600">
                      Chưa bật
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                  {allowExternal
                    ? 'Mở rộng tra cứu sang tài liệu y học mở rộng'
                    : 'Chỉ tra cứu trong kho tài liệu đã được thẩm định'}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
