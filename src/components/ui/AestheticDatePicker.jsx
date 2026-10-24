import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function AestheticDatePicker({ value, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current selected date
  const parsedDate = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(value);
  }, [value]);

  // Current view month & year in picker
  const [viewYear, setViewYear] = useState(() => parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsedDate.getMonth());

  // Format date for trigger display (e.g. "Senin, 5 Oktober 2026")
  const formattedDisplay = useMemo(() => {
    if (!value) return 'Pilih Tanggal...';
    const dayOfWeek = parsedDate.getDay();
    const dateNum = parsedDate.getDate();
    const monthName = MONTH_NAMES[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();
    return `${DAY_NAMES_FULL[dayOfWeek]}, ${dateNum} ${monthName} ${year}`;
  }, [value, parsedDate]);

  // Generate calendar grid days for viewMonth and viewYear
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateStr: `${viewMonth === 0 ? viewYear - 1 : viewYear}-${String(viewMonth === 0 ? 12 : viewMonth).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateStr
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: `${viewMonth === 11 ? viewYear + 1 : viewYear}-${String(viewMonth === 11 ? 1 : viewMonth + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDate = (dateStr) => {
    if (onChange) {
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  // Helper untuk memilih Senin terdekat (siklus FKKP)
  const handleSelectThisMonday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, '0');
    const d = String(monday.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    setViewYear(y);
    setViewMonth(monday.getMonth());
    handleSelectDate(dateStr);
  };

  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-10 w-full items-center justify-between rounded-xl border border-[#1C1917]/15 bg-[#FAF7F2] px-3.5 text-xs font-bold text-[#1C1917] shadow-xs hover:bg-white hover:border-[#3B4B34]/40 focus:outline-none focus:ring-2 focus:ring-[#3B4B34]/25 transition-all group ${className}`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded-lg bg-[#3B4B34]/10 text-[#3B4B34] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{formattedDisplay}</span>
          </div>
          <span className="text-[10px] text-[#78716C] bg-white/80 border border-[#1C1917]/10 px-2 py-0.5 rounded-md font-semibold shrink-0 ml-2 group-hover:border-[#3B4B34]/30">
            Ubah
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent 
        align="start" 
        sideOffset={6}
        className="w-[320px] rounded-[28px] border border-[#1C1917]/15 bg-[#FAF7F2] p-4 text-[#1C1917] shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
      >
        {/* Header Bulan & Tahun */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1C1917]/8">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1C1917]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h4>
            <p className="text-[10px] text-stone-500">Pilih tanggal awal pekan FKKP</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-xl hover:bg-stone-200/60 text-stone-700 flex items-center justify-center transition active:scale-95"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-xl hover:bg-stone-200/60 text-stone-700 flex items-center justify-center transition active:scale-95"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nama-Nama Hari */}
        <div className="grid grid-cols-7 gap-1 text-center my-2.5">
          {DAY_NAMES.map((d, idx) => (
            <span 
              key={d} 
              className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
                idx === 0 ? 'text-rose-500' : idx === 1 ? 'text-[#3B4B34]' : 'text-stone-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Grid Tanggal */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarGrid.map((cell, idx) => {
            const isSelected = cell.dateStr === value;
            const isToday = cell.dateStr === todayStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDate(cell.dateStr)}
                className={`h-8 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-[#3B4B34] text-white font-bold shadow-md scale-105 z-10'
                    : cell.isCurrentMonth
                    ? isToday
                      ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                      : 'text-stone-800 hover:bg-[#3B4B34]/15 hover:text-[#3B4B34]'
                    : 'text-stone-300 hover:text-stone-500'
                }`}
              >
                <span>{cell.dayNum}</span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-amber-600 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="mt-3.5 pt-3 border-t border-[#1C1917]/8 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectThisMonday}
            className="text-[11px] font-bold text-[#3B4B34] hover:bg-[#3B4B34]/10 rounded-xl h-7 px-2.5 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Senin Pekan Ini</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleSelectDate(todayStr)}
            className="text-[11px] font-bold text-stone-600 hover:bg-stone-200/60 rounded-xl h-7 px-2"
          >
            Hari Ini
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
