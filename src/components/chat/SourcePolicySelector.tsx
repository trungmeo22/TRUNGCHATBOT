import React, { useState, useRef, useEffect } from 'react';
import type { SourcePolicy, SourceGroup } from '../../types/chat';
import {
  ALL_SOURCE_GROUPS,
  SOURCE_GROUP_OPTIONS,
  isAllGroupsSelected,
  formatSelectedSourcesLabel,
} from '../../utils/sourcePolicy';
import { Database, ChevronDown, Check, Layers, X } from 'lucide-react';

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

  // Compute selected groups safely
  const selectedGroups: SourceGroup[] =
    currentPolicy?.groups && currentPolicy.groups.length > 0
      ? currentPolicy.groups
      : [...ALL_SOURCE_GROUPS];

  const allSelected = isAllGroupsSelected(selectedGroups);
  const labels = formatSelectedSourcesLabel(selectedGroups);

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

  // Toggle All Sources
  const handleToggleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (allSelected) {
      // If already all selected and clicked again, keep primary Bộ Y tế as safe default
      onPolicyChange({
        scope: 'all',
        groups: ['BYT'],
      });
    } else {
      // Select all 3
      onPolicyChange({
        scope: 'all',
        groups: [...ALL_SOURCE_GROUPS],
      });
    }
  };

  // Toggle individual source group
  const handleToggleGroup = (groupId: SourceGroup, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlySelected = selectedGroups.includes(groupId);
    let newGroups: SourceGroup[];

    if (isCurrentlySelected) {
      // Keep at least 1 source selected
      if (selectedGroups.length <= 1) {
        return;
      }
      newGroups = selectedGroups.filter((g) => g !== groupId);
    } else {
      newGroups = [...selectedGroups, groupId];
    }

    onPolicyChange({
      scope: 'all',
      groups: newGroups,
    });
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left select-none">
      {/* Trigger Button */}
      <button
        type="button"
        id="source-policy-selector-btn"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
          isOpen
            ? 'bg-blue-50/90 text-blue-900 border-blue-300 shadow-xs'
            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Chọn phạm vi nguồn tài liệu y khoa"
        aria-label="Chọn nguồn tài liệu"
        aria-expanded={isOpen}
      >
        <div className="w-4.5 h-4.5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Database className="w-3 h-3" />
        </div>

        <span className="text-gray-500 font-normal text-xs sm:text-sm">Nguồn:</span>
        <span className="font-semibold text-gray-900 truncate max-w-[170px] sm:max-w-[240px]">
          {labels.short}
        </span>

        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
          {allSelected ? 'Tất cả' : `${selectedGroups.length}/3`}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Popover Menu - Compact & Clean */}
      {isOpen && (
        <div
          id="source-policy-dropdown-menu"
          className="absolute bottom-full mb-2 left-0 sm:left-0 sm:right-auto w-[290px] sm:w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Nguồn tài liệu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {allSelected ? 'Tất cả (3/3)' : `${selectedGroups.length}/3`}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master "All Sources" Option */}
          <button
            type="button"
            id="source-select-all-btn"
            onClick={handleToggleSelectAll}
            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
              allSelected
                ? 'bg-blue-50 text-blue-900 font-semibold'
                : 'hover:bg-gray-50 text-gray-800'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                allSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-transparent hover:border-gray-400'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold leading-tight">
                Tất cả nguồn (Khuyến nghị)
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                Bộ Y tế, Hội chuyên khoa VN & Quốc tế
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-gray-100" />

          {/* 3 Individual Checkbox Sources */}
          <div className="space-y-0.5">
            {SOURCE_GROUP_OPTIONS.map((option) => {
              const isChecked = selectedGroups.includes(option.id);
              const isOnlyOne = isChecked && selectedGroups.length === 1;

              return (
                <button
                  key={option.id}
                  type="button"
                  id={`source-group-option-${option.id}`}
                  onClick={(e) => handleToggleGroup(option.id, e)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/60 text-blue-950 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-transparent hover:border-gray-400'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                        {option.label}
                      </span>
                      {isOnlyOne && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-medium border border-amber-200">
                          Tối thiểu 1
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with quick Done button */}
          <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between px-1">
            <span className="text-[11px] text-gray-400 italic">
              Tra cứu theo kho thẩm định
            </span>
            <button
              type="button"
              id="source-selector-done-btn"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
