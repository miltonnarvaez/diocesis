import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './SimpleCalendar.css';

const SimpleCalendar = ({ value, onChange, tileClassName, tileContent, locale = 'es' }) => {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const monthNames = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const dayNames = {
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (onChange) {
      onChange(date);
    }
  };

  const isSelected = (date) => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = monthNames[locale] || monthNames.es;
  const dayName = dayNames[locale] || dayNames.es;

  return (
    <div className="simple-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          <FaChevronLeft />
        </button>
        <h3 className="calendar-month-year">
          {monthName[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          <FaChevronRight />
        </button>
      </div>
      
      <div className="calendar-weekdays">
        {dayName.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((dayObj, index) => {
          const date = dayObj.date;
          const className = [
            'calendar-day',
            !dayObj.isCurrentMonth ? 'calendar-day-other-month' : '',
            isSelected(date) ? 'calendar-day-selected' : '',
            isToday(date) ? 'calendar-day-today' : '',
            tileClassName ? tileClassName({ date }) : ''
          ].filter(Boolean).join(' ');

          return (
            <div
              key={index}
              className={className}
              onClick={() => handleDateClick(date)}
            >
              <span className="calendar-day-number">{date.getDate()}</span>
              {tileContent && tileContent({ date })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleCalendar;
















