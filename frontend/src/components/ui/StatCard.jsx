import React from 'react';
import styles from './StatCard.module.css';

const StatCard = ({ label, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.iconContainer} style={{ backgroundColor: bgColor, color: iconColor }}>
        {Icon && <Icon size={18} />}
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <div className={styles.value}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
