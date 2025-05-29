import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from '../styles/SizeGuide.module.css';

interface SizeGuideProps {
  category: string;
  onClose: () => void;
}

const SizeGuide = ({ category, onClose }: SizeGuideProps) => {
  const [activeTab, setActiveTab] = useState('inches');
  
  // Size guide data for jeans
  const jeansSizeGuide = {
    inches: [
      { size: '28', waist: '28"', hip: '35"', inseam: '30"' },
      { size: '30', waist: '30"', hip: '37"', inseam: '30"' },
      { size: '32', waist: '32"', hip: '39"', inseam: '32"' },
      { size: '34', waist: '34"', hip: '41"', inseam: '32"' },
      { size: '36', waist: '36"', hip: '43"', inseam: '32"' },
      { size: '38', waist: '38"', hip: '45"', inseam: '32"' },
      { size: '40', waist: '40"', hip: '47"', inseam: '32"' }
    ],
    cm: [
      { size: '28', waist: '71 cm', hip: '89 cm', inseam: '76 cm' },
      { size: '30', waist: '76 cm', hip: '94 cm', inseam: '76 cm' },
      { size: '32', waist: '81 cm', hip: '99 cm', inseam: '81 cm' },
      { size: '34', waist: '86 cm', hip: '104 cm', inseam: '81 cm' },
      { size: '36', waist: '91 cm', hip: '109 cm', inseam: '81 cm' },
      { size: '38', waist: '97 cm', hip: '114 cm', inseam: '81 cm' },
      { size: '40', waist: '102 cm', hip: '119 cm', inseam: '81 cm' }
    ]
  };

  // Size guide data for shirts
  const shirtsSizeGuide = {
    inches: [
      { size: 'S', chest: '36-38"', shoulder: '17"', sleeve: '24"' },
      { size: 'M', chest: '39-41"', shoulder: '18"', sleeve: '24.5"' },
      { size: 'L', chest: '42-44"', shoulder: '19"', sleeve: '25"' },
      { size: 'XL', chest: '45-47"', shoulder: '20"', sleeve: '25.5"' },
      { size: 'XXL', chest: '48-50"', shoulder: '21"', sleeve: '26"' }
    ],
    cm: [
      { size: 'S', chest: '91-97 cm', shoulder: '43 cm', sleeve: '61 cm' },
      { size: 'M', chest: '99-104 cm', shoulder: '46 cm', sleeve: '62 cm' },
      { size: 'L', chest: '107-112 cm', shoulder: '48 cm', sleeve: '63.5 cm' },
      { size: 'XL', chest: '114-119 cm', shoulder: '51 cm', sleeve: '65 cm' },
      { size: 'XXL', chest: '122-127 cm', shoulder: '53 cm', sleeve: '66 cm' }
    ]
  };

  // Size guide data for t-shirts
  const tshirtsSizeGuide = {
    inches: [
      { size: 'S', chest: '36-38"', shoulder: '16.5"', length: '27"' },
      { size: 'M', chest: '39-41"', shoulder: '17.5"', length: '28"' },
      { size: 'L', chest: '42-44"', shoulder: '18.5"', length: '29"' },
      { size: 'XL', chest: '45-47"', shoulder: '19.5"', length: '30"' },
      { size: 'XXL', chest: '48-50"', shoulder: '20.5"', length: '31"' }
    ],
    cm: [
      { size: 'S', chest: '91-97 cm', shoulder: '42 cm', length: '69 cm' },
      { size: 'M', chest: '99-104 cm', shoulder: '44 cm', length: '71 cm' },
      { size: 'L', chest: '107-112 cm', shoulder: '47 cm', length: '74 cm' },
      { size: 'XL', chest: '114-119 cm', shoulder: '50 cm', length: '76 cm' },
      { size: 'XXL', chest: '122-127 cm', shoulder: '52 cm', length: '79 cm' }
    ]
  };

  // Determine which size guide to use based on category
  let sizeGuide;
  let sizeGuideTitle;
  let columns;

  if (category.toLowerCase().includes('jeans') || category.toLowerCase() === 'men') {
    sizeGuide = jeansSizeGuide;
    sizeGuideTitle = 'Jeans Size Guide';
    columns = activeTab === 'inches' 
      ? ['Size', 'Waist', 'Hip', 'Inseam'] 
      : ['Size', 'Waist', 'Hip', 'Inseam'];
  } else if (category.toLowerCase().includes('shirt') && !category.toLowerCase().includes('t-shirt')) {
    sizeGuide = shirtsSizeGuide;
    sizeGuideTitle = 'Shirts Size Guide';
    columns = activeTab === 'inches' 
      ? ['Size', 'Chest', 'Shoulder', 'Sleeve'] 
      : ['Size', 'Chest', 'Shoulder', 'Sleeve'];
  } else {
    sizeGuide = tshirtsSizeGuide;
    sizeGuideTitle = 'T-Shirts Size Guide';
    columns = activeTab === 'inches' 
      ? ['Size', 'Chest', 'Shoulder', 'Length'] 
      : ['Size', 'Chest', 'Shoulder', 'Length'];
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.sizeGuideModal}>
        <div className={styles.modalHeader}>
          <h2>{sizeGuideTitle}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.unitToggle}>
            <button 
              className={`${styles.unitButton} ${activeTab === 'inches' ? styles.active : ''}`}
              onClick={() => setActiveTab('inches')}
            >
              Inches
            </button>
            <button 
              className={`${styles.unitButton} ${activeTab === 'cm' ? styles.active : ''}`}
              onClick={() => setActiveTab('cm')}
            >
              Centimeters
            </button>
          </div>

          <div className={styles.sizeTable}>
            <table>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide[activeTab as keyof typeof sizeGuide].map((item: any, index: number) => (
                  <tr key={index}>
                    {Object.values(item).map((value: any, valueIndex: number) => (
                      <td key={valueIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.measurementGuide}>
            <h3>How to Measure</h3>
            <div className={styles.measurementSteps}>
              {category.toLowerCase().includes('jeans') || category.toLowerCase() === 'men' ? (
                <>
                  <div className={styles.measurementStep}>
                    <strong>Waist:</strong> Measure around the narrowest part of your waist, keeping the tape measure horizontal.
                  </div>
                  <div className={styles.measurementStep}>
                    <strong>Hip:</strong> Measure around the fullest part of your hips, keeping the tape measure horizontal.
                  </div>
                  <div className={styles.measurementStep}>
                    <strong>Inseam:</strong> Measure from the crotch to the bottom of the leg.
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.measurementStep}>
                    <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape measure horizontal.
                  </div>
                  <div className={styles.measurementStep}>
                    <strong>Shoulder:</strong> Measure from one shoulder point to the other, across the back.
                  </div>
                  <div className={styles.measurementStep}>
                    <strong>{category.toLowerCase().includes('t-shirt') ? 'Length' : 'Sleeve'}:</strong> 
                    {category.toLowerCase().includes('t-shirt') 
                      ? ' Measure from the highest point of the shoulder to the bottom hem.' 
                      : ' Measure from the shoulder point to the wrist.'}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.sizeNote}>
            <p>Note: These measurements are a general guide. Fit may vary depending on fabric and style.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide; 