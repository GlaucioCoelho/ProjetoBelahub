import React from 'react';
import styles from './AppointmentItem.module.css';
import Badge from '../ui/Badge';

const AppointmentItem = ({ appointment, professional, service, client }) => {
  const statusMap = {
    scheduled: 'Agendado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  const professionalColor = professional?.color || '#7B68EE';

  return (
    <div className={styles.appointmentItem}>
      <div
        className={styles.colorBar}
        style={{ backgroundColor: professionalColor }}
      />
      <div className={styles.content}>
        <div className={styles.clientName}>{client?.name || 'Cliente'}</div>
        <div className={styles.details}>
          {appointment.time} · {service?.name} · {professional?.name}
        </div>
      </div>
      <Badge status={appointment.status} label={statusMap[appointment.status]} />
    </div>
  );
};

export default AppointmentItem;
