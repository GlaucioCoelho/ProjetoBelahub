import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import styles from './PWAInstallPrompt.module.css';

export const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = React.useState(false);

  if (!canInstall || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <Download size={18} className={styles.icon} />
        <div className={styles.text}>
          <div className={styles.title}>Instalar BelaHub</div>
          <div className={styles.subtitle}>Acesse como um app no seu celular</div>
        </div>
        <button className={styles.installBtn} onClick={install}>
          Instalar
        </button>
        <button
          className={styles.closeBtn}
          onClick={() => setDismissed(true)}
          aria-label="Descartar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
