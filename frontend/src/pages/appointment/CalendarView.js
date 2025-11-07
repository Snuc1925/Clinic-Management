import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService, treatmentService } from '../../services/api';
import './AppointmentManagement.css';

function CalendarView() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, currentDate, viewMode]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      const appointmentResponse = await appointmentService.getCalendarData(
        clinicId,
        start.toISOString(),
        end.toISOString()
      );
      setAppointments(appointmentResponse.data);

      const treatmentResponse = await treatmentService.getClinicTreatments(clinicId);
      const filteredTreatments = treatmentResponse.data.filter(t => {
        const treatmentDate = new Date(t.date);
        return treatmentDate >= start && treatmentDate <= end;
      });
      setTreatments(filteredTreatments);

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });

    const dayTreatments = treatments.filter(t => {
      return t.date === dateStr;
    });

    return { appointments: dayAppointments, treatments: dayTreatments };
  };

  const renderMonthView = () => {
    const { start } = getDateRange();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = start.getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {events.appointments.map(apt => (
              <div key={`apt-${apt.id}`} className="event appointment">
                {new Date(apt.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {apt.patientName}
              </div>
            ))}
            {events.treatments.map(t => (
              <div key={`treat-${t.id}`} className="event treatment">
                Treatment: {t.patientName}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="calendar-grid month">{days}</div>;
  };

  const renderListView = () => {
    const allEvents = [
      ...appointments.map(apt => ({
        type: 'appointment',
        date: new Date(apt.appointmentDate),
        data: apt
      })),
      ...treatments.map(t => ({
        type: 'treatment',
        date: new Date(t.date + 'T12:00:00'),
        data: t
      }))
    ].sort((a, b) => a.date - b.date);

    return (
      <div className="list-view">
        {allEvents.length === 0 ? (
          <p className="no-data">No events for this period</p>
        ) : (
          allEvents.map((event, idx) => (
            <div key={idx} className={`event-item ${event.type}`}>
              <div className="event-date">
                {event.date.toLocaleString()}
              </div>
              <div className="event-details">
                {event.type === 'appointment' ? (
                  <>
                    <strong>Appointment</strong>
                    <p>Patient: {event.data.patientName}</p>
                    <p>Doctor: {event.data.doctorName}</p>
                    <p>Status: <span className={`status ${event.data.status}`}>{event.data.status}</span></p>
                  </>
                ) : (
                  <>
                    <strong>Treatment</strong>
                    <p>Patient: {event.data.patientName}</p>
                    <p>Doctor: {event.data.doctorName}</p>
                    <p>Payment: <span className={`status ${event.data.paymentStatus}`}>{event.data.paymentStatus}</span></p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="calendar-view">
      <div className="header">
        <h2>Calendar View</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/appointments`)}>
            List View
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
            Back to Clinic
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="calendar-controls">
        <button onClick={() => navigateDate(-1)}>Previous</button>
        <div className="view-selector">
          <button 
            className={viewMode === 'day' ? 'active' : ''} 
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''} 
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={viewMode === 'month' ? 'active' : ''} 
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
        <div className="current-date">
          {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
          {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button onClick={() => setCurrentDate(new Date())}>Today</button>
        <button onClick={() => navigateDate(1)}>Next</button>
      </div>

      {loading ? (
        <div className="loading">Loading calendar...</div>
      ) : (
        <>
          {viewMode === 'month' && renderMonthView()}
          {(viewMode === 'day' || viewMode === 'week') && renderListView()}
        </>
      )}

      <div className="legend">
        <div className="legend-item">
          <div className="color-box appointment"></div>
          <span>Appointments</span>
        </div>
        <div className="legend-item">
          <div className="color-box treatment"></div>
          <span>Treatments</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
