import React from 'react';
import styles from './BasePage.module.css';

const BasePage = ({ title, description, icon: Icon, children }) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={22} className={styles.icon} />
          </div>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>

      {children && <div className={styles.pageContent}>{children}</div>}

      {!children && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {Icon && <Icon size={32} />}
          </div>
          <h2>Em desenvolvimento</h2>
          <p>Esta funcionalidade será lançada em breve.</p>
        </div>
      )}
    </div>
  );
};

export default BasePage;
