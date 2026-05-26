import { Skeleton } from '../../../components/Comum/Skeleton';
import styles from './style.module.css';

/**
 * Skeleton loader for FinalizarCompra page.
 * Matches the checkout-grid layout to reduce CLS.
 */
export const FinalizarCompraSkeleton = () => {
  return (
    <div data-cy="checkout-loading-state">
      {/* Breadcrumb */}
      <div className={styles['checkout-breadcrumb']}>
        <Skeleton variant="text" width={200} height={20} />
      </div>

      {/* Grid Layout */}
      <div className={styles['checkout-grid']}>
        {/* Left Column - Main Content */}
        <div className={styles['checkout-card-spaced']}>
          {/* Address Card */}
          <div className="card">
            <Skeleton variant="rectangular" height={150} />
          </div>

          {/* Delivery Card */}
          <div className={`card ${styles['checkout-card-spaced']}`}>
            <Skeleton variant="rectangular" height={200} />
          </div>

          {/* Payment Card */}
          <div className="card">
            <Skeleton variant="rectangular" height={250} />
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className={styles['checkout-summary-card']}>
          <div className="card">
            <Skeleton variant="rectangular" height={300} />
          </div>
        </div>
      </div>
    </div>
  );
};
