import React from 'react';
import styles from './StockAlert.module.css';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';

const StockAlert = ({ products = [] }) => {
  const lowStockProducts = products.filter(
    p => p.quantity <= (p.minQuantity || 5)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Alertas de Estoque</h2>
        <a href="#produtos" className={styles.viewAll}>
          Estoque →
        </a>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.checkIcon}>
            <FiCheck size={32} />
          </div>
          <p>Estoque abastecido!</p>
          <span>Todos os produtos estão acima do mínimo</span>
        </div>
      ) : (
        <div className={styles.list}>
          {lowStockProducts.map(product => (
            <div key={product.id} className={styles.item}>
              <div className={styles.warning}>
                <FiAlertTriangle size={16} />
              </div>
              <div className={styles.info}>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.quantity}>
                  {product.quantity} unidades (mín: {product.minQuantity})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockAlert;
