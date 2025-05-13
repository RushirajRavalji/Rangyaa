import styles from '../styles/Hero.module.css';

interface HeroProps {
  heading: string;
  subheading: string;
  backgroundImage: string;
}

const Hero = ({ heading, subheading, backgroundImage }: HeroProps) => {
  return (
    <section 
      className={styles.hero} 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="container">
        <div className={styles.heroContent}>
          <h1>{heading}</h1>
          <p>{subheading}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero; 