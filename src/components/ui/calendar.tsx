
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  modifiers?: {
    hasAppointment?: Date[];
  };
  modifiersStyles?: {
    hasAppointment?: React.CSSProperties;
  };
  initialFocus?: boolean;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  modifiers,
  modifiersStyles,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Adicionar dias do mês anterior para completar a primeira semana
  const startDay = getDay(monthStart);
  const previousMonthDays = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (i + 1));
    previousMonthDays.push(day);
  }

  // Adicionar dias do próximo mês para completar a última semana
  const totalCells = 42; // 6 semanas * 7 dias
  const nextMonthDays = [];
  const totalDaysShown = previousMonthDays.length + daysInMonth.length;
  const remainingCells = totalCells - totalDaysShown;
  
  for (let i = 1; i <= remainingCells; i++) {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + i);
    nextMonthDays.push(day);
  }

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    if (disabled && disabled(day)) return;
    if (onSelect) {
      onSelect(day);
    }
  };

  const isDaySelected = (day: Date) => {
    return selected && isSameDay(day, selected);
  };

  const isDayToday = (day: Date) => {
    return isToday(day);
  };

  const isDayInCurrentMonth = (day: Date) => {
    return isSameMonth(day, currentMonth);
  };

  const isDayDisabled = (day: Date) => {
    return disabled ? disabled(day) : false;
  };

  const hasAppointment = (day: Date) => {
    return modifiers?.hasAppointment?.some(appointmentDay => 
      isSameDay(day, appointmentDay)
    );
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className={cn("p-3 pointer-events-auto", className)} {...props}>
      <div className="flex flex-col space-y-4">
        {/* Header com navegação */}
        <div className="flex justify-center pt-1 relative items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendário */}
        <div className="w-full border-collapse space-y-1">
          {/* Cabeçalho dos dias da semana */}
          <div className="flex">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] h-9 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-0">
            {allDays.map((day, index) => {
              const isSelected = isDaySelected(day);
              const isCurrentMonth = isDayInCurrentMonth(day);
              const isDisabled = isDayDisabled(day);
              const isTodayDay = isDayToday(day);
              const hasAppointmentDay = hasAppointment(day);

              return (
                <div key={index} className="h-9 w-9 text-center text-sm p-0 relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      isTodayDay && !isSelected && "bg-accent text-accent-foreground",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                      hasAppointmentDay && !isSelected && "bg-blue-500 text-white font-bold hover:bg-blue-600"
                    )}
                    style={hasAppointmentDay ? modifiersStyles?.hasAppointment : undefined}
                    onClick={() => handleDayClick(day)}
                    disabled={isDisabled}
                  >
                    {format(day, 'd')}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
